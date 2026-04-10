let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let myChart = null;
let heroChart = null;

// Theme Toggle Logic
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

function applyTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-mode');
        themeToggle.textContent = '🌙';
        Chart.defaults.color = '#475569';
    } else {
        body.classList.remove('light-mode');
        themeToggle.textContent = '☀️';
        Chart.defaults.color = '#94a3b8';
    }
    if (myChart) updateChart();
}

const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
    const isLight = body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    applyTheme(isLight ? 'light' : 'dark');
});

function renderExpenses() {
    const tbody = document.querySelector('#expenseTable tbody');
    tbody.innerHTML = '';
    
    let total = 0;
    expenses.forEach((exp, index) => {
        total += exp.amount;
        tbody.innerHTML += `
            <tr>
                <td>${exp.name}</td>
                <td><span class="pill-badge" style="margin: 0; padding: 0.2rem 0.6rem;">${exp.category}</span></td>
                <td style="color: var(--accent-glow); font-weight: 600;">$${exp.amount.toFixed(2)}</td>
                <td><button class="action-btn" onclick="deleteExpense(${index})">Delete</button></td>
            </tr>
        `;
    });
    
    document.getElementById('totalExpenses').innerText = `$${total.toFixed(2)}`;
    updateChart();
    updateHeroChart();
}

function addExpense(e) {
    e.preventDefault();
    const name = document.getElementById('expName').value;
    const amount = parseFloat(document.getElementById('expAmount').value);
    const category = document.getElementById('expCategory').value;
    
    if(!name || isNaN(amount) || !category) return;
    
    expenses.push({ name, amount, category });
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    document.getElementById('expenseForm').reset();
    renderExpenses();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
}

function clearAll() {
    if(confirm("Are you sure you want to clear all data? This cannot be undone.")) {
        expenses = [];
        localStorage.removeItem('expenses');
        renderExpenses();
    }
}

function prepareChartData() {
    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other'];
    const dataObj = {};
    categories.forEach(c => dataObj[c] = 0);
    
    expenses.forEach(exp => {
        if(dataObj[exp.category] !== undefined) {
             dataObj[exp.category] += exp.amount;
        } else {
             dataObj['Other'] += exp.amount;
        }
    });
    
    return {
        labels: Object.keys(dataObj).filter(k => dataObj[k] > 0),
        data: Object.values(dataObj).filter(v => v > 0)
    };
}

function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const { labels, data } = prepareChartData();
    
    if (myChart) myChart.destroy();
    
    // Set text color globally for chart.js
    Chart.defaults.color = '#94a3b8';
    
    if (data.length === 0) {
        // Show empty state
        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Data'],
                datasets: [{ data: [1], backgroundColor: ['#334155'], borderWidth: 0 }]
            },
            options: {cutout: '75%', plugins: {legend: {display: false}, tooltip: {enabled: false}}}
        });
        return;
    }

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

function updateHeroChart() {
    const ctx = document.getElementById('heroChart').getContext('2d');
    if(heroChart) heroChart.destroy();
    
    // Abstract chart just for visuals
    heroChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Spending',
                data: [120, 190, 80, 250],
                borderColor: '#10b981',
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {legend:{display:false}},
            scales: {
                x: {display:false},
                y: {display:false}
            }
        }
    });
}

// Initial load
window.onload = renderExpenses;
