const form = document.querySelector("form");
const ul = document.querySelector("ul");
const record = document.querySelector("#all-record");
const token = localStorage.getItem("token");
const downloadReport = document.getElementById("downloadReport");
form.addEventListener("submit", (e) => {
    e.preventDefault();
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
    axios.post("http://127.0.0.1:3000/expense/add-expense", expenseDetails, { headers: { "Authorization": token } })
        .then(res => {
            window.location.reload();
        })
        .catch(err => console.log(err))
});

document.addEventListener('DOMContentLoaded', () => {
    axios.get("http://127.0.0.1:3000/expense/get-expense", { headers: { "Authorization": token } })
        .then(result => {
            const premium = result.data.premium;
            if (premium) {
                const premium = document.getElementById('premium');
                premium.innerHTML = `<h4>You are a premium user</h4>
                <button type="button" class="btn btn-warning" name="show-leaderboard" id="show-leaderboard" data-bs-toggle="modal" data-bs-target="#leaderboard">Show Leaderboard</button>
                <button type="button" class="btn btn-success" name="generate-report" id="generate-report" data-bs-toggle="modal" data-bs-target="#report">Generate Report</button>
                <button type="button" class="btn btn-info" name="show-report" id="show-report" data-bs-toggle="modal" data-bs-target="#showReportModal">Show All Reports</button>`;
                premium.style.color = "yellow";
                const leaderboardItem = document.getElementById("leaderboard-items");
                axios.get("http://127.0.0.1:3000/premium/leaderboard", { headers: { "Authorization": token } })
                    .then(result => {
                        result.data.forEach(user => {
                            const li = document.createElement("li");
                            li.innerText = `${user.name} - ${user.totalexpense}`;
                            leaderboardItem.appendChild(li);
                        });
                    })
                    .catch(err => console.log(err));

                const monthlyExpense = document.getElementById("monthly-expense");
                const yearlyExpense = document.getElementById("yearly-expense");
                const allReports = document.getElementById("all-reports");
                axios.get("http://127.0.0.1:3000/premium/report", { headers: { "Authorization": token } })
                    .then(result => {
                        const monthly = result.data.monthly;
                        const yearly = result.data.yearly;
                        const reports = result.data.reports;
                        if (Object.keys(monthly).length != 0) monthlyExpense.firstElementChild.lastElementChild.remove();
                        if (Object.keys(yearly).length != 0) yearlyExpense.firstElementChild.lastElementChild.remove();
                        if (Object.keys(reports).length != 0) allReports.firstElementChild.lastElementChild.remove();
                        Object.values(monthly).forEach(result => {
                            const tr = document.createElement("tr");
                            const td1 = document.createElement("td");
                            const td2 = document.createElement("td");
                            const td3 = document.createElement("td");
                            const td4 = document.createElement("td");
                            const td5 = document.createElement("td");
                            td1.innerText = result.date;
                            td2.innerText = result.description;
                            td3.innerText = result.category;
                            td4.innerText = result.expense;
                            td5.innerText = result.income;
                            tr.appendChild(td1);
                            tr.appendChild(td2);
                            tr.appendChild(td3);
                            tr.appendChild(td4);
                            tr.appendChild(td5);
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
                        Object.values(reports).forEach(result => {
                            const tr = document.createElement("tr");
                            const td1 = document.createElement("td");
                            const td2 = document.createElement("td");
                            td1.innerText = result.date;
                            td2.innerHTML = `<a href="${result.url}">${result.url}</a>`;
                            tr.appendChild(td1);
                            tr.appendChild(td2);
                            allReports.appendChild(tr);
                        });
                    })
                    .catch(err => console.log(err));
            }

            if (result.data.expenses.length != 0) record.firstElementChild.lastElementChild.remove();
            result.data.expenses.forEach(res => {
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
                editBtn.addEventListener("click", () => {
                    axios.delete(`http://127.0.0.1:3000/expense/delete-expense/${editBtn.parentElement.parentElement.id}`, { headers: { "Authorization": token } })
                        .then(res => {
                            if (expense >= income) {
                                document.getElementById('amount').value = expense;
                            }
                            else {
                                document.getElementById('amount').value = income;
                            }
                            document.getElementById('description').value = description;
                            document.getElementById('category').value = category;
                            editBtn.parentElement.parentElement.remove();
                        }).catch(err => console.log(err));
                })
                deleteBtn.addEventListener("click", () => {
                    axios.delete(`http://127.0.0.1:3000/expense/delete-expense/${deleteBtn.parentElement.parentElement.id}`, { headers: { "Authorization": token } })
                        .then(res => {
                            window.location.reload();
                        }).catch(err => console.log(err));
                });
            });
        })
        .catch(err => console.log(err))
});

document.getElementById('buy-premium').addEventListener('click', async (e) => {
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
    e.preventDefault();
    rzp1.on('payment.failed', async function (response) {
        await axios.post("http://127.0.0.1:3000/purchase/failedtransactionstatus", {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
        }, { headers: { "Authorization": token } })
        alert(response.error.description);
    });
})

function onModalClose() {
    window.location.reload();
}

downloadReport.addEventListener("click", () => {
    axios.get("http://127.0.0.1:3000/premium/download-report", { headers: { "Authorization": token } })
        .then(result => {
            const a = document.createElement("a");
            a.href = result.data.fileUrl;
            a.download = "report.txt";
            a.click();
        })
        .catch(err => console.log(err));
})