/* DOM Elements */
const form = document.querySelector("form");
const token = localStorage.getItem("token");
const downloadReport = document.getElementById("downloadReport");

/* Expnese Functions */
async function handleAddExpense(e) {
    e.preventDefault();
    try {
        const btn = e.submitter.value;
        const amount = e.target.amount.value;
        const description = e.target.description.value;
        const category = e.target.category.value;
        let expenseDetails = {}
        if (btn == "income") {
            expenseDetails = {
                income: amount,
                description: description,
                category: category
            };
        }
        else {
            expenseDetails = {
                expense: amount,
                description: description,
                category: category
            };
        }
        await axios.post("http://127.0.0.1:3000/expense/add-expense", expenseDetails, { headers: { "Authorization": token } });
        window.location.reload();
    }
    catch (err) {
        alert(err.response.data.error);
    }
}
async function handleDeleteExpense(btn) {
    try {
        btn.addEventListener("click", async () => {
            await axios.delete(`http://127.0.0.1:3000/expense/delete-expense/${btn.parentElement.parentElement.id}`, { headers: { "Authorization": token } })
            window.location.reload();
        });
    }
    catch (err) {
        alert(err.response.data.error + "\nUnable to delete response");
    }
}
async function handleEditExpense(btn, expense, income, description, category) {
    try {
        btn.addEventListener("click", async () => {
            await axios.delete(`http://127.0.0.1:3000/expense/delete-expense/${btn.parentElement.parentElement.id}`, { headers: { "Authorization": token } })
            if (expense >= income) {
                document.getElementById('amount').value = expense;
            }
            else {
                document.getElementById('amount').value = income;
            }
            document.getElementById('description').value = description;
            document.getElementById('category').value = category;
            btn.parentElement.parentElement.remove();
        })
    }
    catch (err) {
        alert(err.response.data.error + "\nUnable to edit response");
    }
}
async function handleGetExpense(page) {
    const record = document.querySelector("#all-record");
    const paginationItems = document.querySelectorAll('.pagination .page-item a');
    try {
        const getExpense = await axios.get(`http://127.0.0.1:3000/expense/getExpensePerPage?page=${page}`, { headers: { "Authorization": token } })
        const premium = getExpense.data.premium;
        if (premium) {
            premiumFeatures();
        }
        const pagesDetail = {
            hasNextPage: getExpense.data.pagesDetail.hasNextPage,
            hasPreviousPage: getExpense.data.pagesDetail.hasPreviousPage,
            nextPage: getExpense.data.pagesDetail.nextPage,
            previousPage: getExpense.data.pagesDetail.previousPage,
            totalPages: getExpense.data.pagesDetail.totalPages
        };
        paginationItems[3].innerText = pagesDetail.totalPages;
        paginationItems[1].innerText = 1;
        paginationItems[2].innerText = page;
        if (getExpense.data.expenses.length != 0) record.firstElementChild.lastElementChild.remove();
        getExpense.data.expenses.forEach(res => {
            const expense = res.expense;
            const income = res.income;
            const description = res.description;
            const category = res.category;
            const buttonHTML = `
                <button type="button" class="btn btn-success edit-btn" style="margin-left:auto; margin-right:5px;">Edit</button>
                <button type="button" class="btn btn-danger delete-btn">Delete</button>
                `;
            const tr = document.createElement("tr");
            tr.id = res.id;
            const td1 = document.createElement("td");
            const td2 = document.createElement("td");
            const td3 = document.createElement("td");
            const td4 = document.createElement("td");
            const td5 = document.createElement("td");
            td1.innerText = income;
            td1.classList.add("income");
            td2.innerText = expense;
            td2.classList.add("expense");
            td3.innerText = description;
            td4.innerText = category;
            td5.innerHTML = buttonHTML;
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            record.appendChild(tr);

            const editBtn = tr.querySelector(".edit-btn");
            const deleteBtn = tr.querySelector(".delete-btn");
            handleDeleteExpense(deleteBtn);
            handleEditExpense(editBtn, expense, income, description, category);
        });
    }
    catch (err) {
        alert(err.response.data.error + "\nFacing problem in fetching expense");
    }
}

/* Premium Feature Functions */
async function buyPremium() {
    const response = await axios.get('http://127.0.0.1:3000/purchase/premiummembership', { headers: { "Authorization": token } })
    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response) {
            await axios.post("http://127.0.0.1:3000/purchase/updatetransactionstatus", {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
            }, { headers: { "Authorization": token } })

            alert("You are a Premium User Now");
            window.location.reload();
        }
    }
    var rzp1 = new Razorpay(options);
    rzp1.open();
    rzp1.on('payment.failed', async function (response) {
        await axios.post("http://127.0.0.1:3000/purchase/failedtransactionstatus", {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
        }, { headers: { "Authorization": token } })
        alert(response.error.description);
    });
}
async function premiumFeatures() {
    try {
        const premium = document.getElementById('premium');
        premium.innerHTML = `<h4>You are a premium user</h4>
    <button type="button" class="btn btn-warning" name="show-leaderboard" id="show-leaderboard" data-bs-toggle="modal" data-bs-target="#leaderboard" onclick="premiumLeaderboard()">Show Leaderboard</button>
    <button type="button" class="btn btn-success" name="generate-report" id="generate-report" data-bs-toggle="modal" data-bs-target="#report" onclick="premiumGenerateReport()">Generate Report</button>
    <button type="button" class="btn btn-info" name="show-report" id="show-report" data-bs-toggle="modal" data-bs-target="#showReportModal" onclick="premiumShowAllReports()">Show All Reports</button>`;
        premium.style.color = "yellow";
    }
    catch (err) {
        console.log(err);
    }
}
async function premiumLeaderboard() {
    try {
        const leaderboardItem = document.getElementById("leaderboard-items");
        resetLeaderboard(leaderboardItem);
        const getLeaderboard = await axios.get("http://127.0.0.1:3000/premium/leaderboard", { headers: { "Authorization": token } });
        getLeaderboard.data.forEach(user => {
            const li = document.createElement("li");
            li.innerText = `${user.name} - ${user.totalexpense}`;
            leaderboardItem.appendChild(li);
        });
    }
    catch (err) {
        alert(err.response.data.error + "\nFacing problem in fetching leaderboard");
    }
}
async function premiumGenerateReport() {
    try {
        const monthlyExpense = document.getElementById("monthly-expense");
        const yearlyExpense = document.getElementById("yearly-expense");
        const currentYear = document.getElementById("current-year");
        const currentMonth = document.getElementById("current-month");
        const getReport = await axios.get("http://127.0.0.1:3000/premium/report", { headers: { "Authorization": token } })
        const monthly = getReport.data.monthly;
        const yearly = getReport.data.yearly;
        if (getReport.data.currentYear)
            currentYear.innerText = getReport.data.currentYear;
        if (getReport.data.currentMonth)
            currentMonth.innerText = getReport.data.currentMonth;
        resetGeneratedReport(monthlyExpense, yearlyExpense);
        if (Object.keys(monthly).length != 0 && monthlyExpense.firstElementChild.lastElementChild.innerText.trim() == "No Data Available!") {
            monthlyExpense.firstElementChild.lastElementChild.remove();
        }
        if (Object.keys(yearly).length != 0 && yearlyExpense.firstElementChild.lastElementChild.innerText.trim() == "No Data Available!") {
            yearlyExpense.firstElementChild.lastElementChild.remove();
        }
        Object.values(monthly).forEach(result => {
            const tr = document.createElement("tr");
            const td1 = document.createElement("td");
            const td2 = document.createElement("td");
            const td3 = document.createElement("td");
            td1.innerText = result.date;
            td2.innerText = result.expense;
            td3.innerText = result.income;
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            monthlyExpense.appendChild(tr);
        });
        Object.values(yearly).forEach(result => {
            const tr = document.createElement("tr");
            const td1 = document.createElement("td");
            const td2 = document.createElement("td");
            const td3 = document.createElement("td");
            const td4 = document.createElement("td");
            td1.innerText = result.month;
            td2.innerText = result.income;
            td3.innerText = result.expense;
            td4.innerText = result.savings;
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            yearlyExpense.appendChild(tr);
        });
    }
    catch (err) {
        alert(err.response.data.error + "\nFacing problem in generating report");
    }
}
async function premiumDownloadReport() {
    try {
        axios.get("http://127.0.0.1:3000/premium/download-report", { headers: { "Authorization": token } })
            .then(result => {
                const a = document.createElement("a");
                a.href = result.data.fileUrl;

                a.download = "report.txt";
                a.click();
            })
            .catch(err => console.log(err));
    }
    catch (err) {
        alert(err.response.data.error + "\nFacing problem in downloading report");
    }
}
async function premiumShowAllReports() {
    try {
        const allReports = document.getElementById("all-reports");
        const getReport = await axios.get("http://127.0.0.1:3000/premium/report", { headers: { "Authorization": token } })
        const reports = getReport.data.reports;
        allReports.innerHTML = `
        <tr>
            <th>Date</th>
            <th>URL</th>
        </tr>
        <tr>
            <td colspan="2">No Data Available!</td>
        </tr>`;

        if (Object.keys(reports).length != 0 && allReports.firstElementChild.lastElementChild.innerText.trim() == "No Data Available!") {
            allReports.firstElementChild.lastElementChild.remove();
        }
        Object.values(reports).forEach((result, index) => {
            const tr = document.createElement("tr");
            const td1 = document.createElement("td");
            const td2 = document.createElement("td");
            td1.innerText = result.date;
            td2.innerHTML = `<a href="${result.url}">Report ${index + 1}</a>`;
            tr.appendChild(td1);
            tr.appendChild(td2);
            allReports.appendChild(tr);
        });
    }
    catch (err) {
        alert(err.response.data.error + "\nFacing problem in generating report");
    }
}

/* DOM Manipulation */
/* On Page Reload */
document.addEventListener('DOMContentLoaded', async () => {
    const currentPage = localStorage.getItem('currentPage') || 1;
    const pagination = document.querySelector(".pagination");
    handleGetExpense(currentPage);
    handlePageChange();
    handlePageNavDisable(pagination, currentPage);
});
/* Page Change Events */
function handlePageChange() {
    const paginationItems = document.querySelectorAll('.pagination .page-item a');
    const pagination = document.querySelector(".pagination");
    const record = document.querySelector("#all-record");
    paginationItems.forEach(function (item) {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            let currentPage = localStorage.getItem('currentPage') || 1;
            let pageNumber = parseInt(e.target.innerText);
            if (e.target.innerText == "Next") {
                pageNumber = parseInt(currentPage) + 1;
            }
            else if (e.target.innerText == "Previous") {
                pageNumber = parseInt(currentPage) - 1;
            }
            resetRecords(record);
            handleGetExpense(pageNumber);
            if (!isNaN(pageNumber)) {
                localStorage.setItem('currentPage', pageNumber);
            }
            handlePageNavDisable(pagination, pageNumber);
        });
    });
}
function handlePageNavDisable(pagination, pageNumber) {
    const previousBtn = pagination.firstElementChild;
    const nextBtn = pagination.lastElementChild;
    const lastPage = pagination.lastElementChild.previousElementSibling.firstElementChild.innerText;
    if (pageNumber > 1) {
        previousBtn.classList.remove('disabled');
    }
    else {
        previousBtn.classList.add('disabled');
    }
    if (pageNumber < lastPage) {
        nextBtn.classList.remove('disabled');
    }
    else {
        nextBtn.classList.add('disabled');
    }
}
/* Add Expense Form */
form.addEventListener("submit", (e) => {
    handleAddExpense(e);
});
/* Buy Premium Button */
document.getElementById('buy-premium').addEventListener('click', async (e) => {
    e.preventDefault();
    buyPremium();
})
/* Download Report Button */
downloadReport.addEventListener("click", () => {
    premiumDownloadReport();
})

/* Reset Functions */
function resetRecords(record) {
    record.innerHTML = `<tr>
        <th>Income</th>
        <th>Expense</th>
        <th>Description</th>
        <th>Category</th>
        <th>Buttons</th>
    </tr>
    <tr>
        <td colspan="5">No Data Available!</td>
    </tr>`;
}
function resetLeaderboard(leaderboardItem) {
    leaderboardItem.innerHTML = "";
}
function resetGeneratedReport(monthlyExpense, yearlyExpense) {
    monthlyExpense.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Income</th>
            <th>Expense</th>
        </tr>
        <tr>
            <td colspan="3">No Data Available!</td>
        </tr>`;
    yearlyExpense.innerHTML = `
        <tr>
            <th>Month</th>
            <th>Income</th>
            <th>Expense</th>
            <th>Savings</th>
        </tr>
        <tr>
            <td colspan="4">No Data Available!</td>
        </tr>`;
}