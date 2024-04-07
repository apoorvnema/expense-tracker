const add = document.querySelector("form");
const ul = document.querySelector("ul");
let count;
if (localStorage.getItem("maxCount")) {
    count = JSON.parse(localStorage.getItem("maxCount")) + 1;
} else {
    localStorage.setItem("maxCount", 0);
    count = 1;
}
add.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = e.target.amount.value;
    const description = e.target.description.value;
    const category = e.target.category.value;
    const li = document.createElement("li");
    const buttonHTML = `<div>
    <button type="button" class="btn btn-success" onClick=handleEdit(event)>Edit</button>
    <button type="button" class="btn btn-danger" onClick=handleDelete(event)>Delete</button>
    </div>`;
    li.innerHTML = `${amount} | ${description} | ${category} ${buttonHTML}`;
    li.classList.add("list-group-item");
    li.classList.add("d-flex")
    li.classList.add("justify-content-between")
    li.classList.add("align-items-center")
    li.id = count;
    ul.appendChild(li);
    const obj = {
        amount,
        description,
        category,
    };
    localStorage.setItem(count++, JSON.stringify(obj));
    localStorage.setItem("maxCount", count - 1);
});

const maxCount = JSON.parse(localStorage.getItem("maxCount"));
for (let i = 1; i <= maxCount; i++) {
    const obj = JSON.parse(localStorage.getItem(i));
    const li = document.createElement("li");
    const buttonHTML = `<div>
    <button type="button" class="btn btn-success" onClick=handleEdit(event)>Edit</button>
    <button type="button" class="btn btn-danger" onClick=handleDelete(event)>Delete</button>
    </div>`;
    li.innerHTML = `${obj.amount} | ${obj.description} | ${obj.category} ${buttonHTML}`;
    li.id = count;
    li.classList.add("list-group-item");
    li.classList.add("d-flex")
    li.classList.add("justify-content-between")
    li.classList.add("align-items-center")
    ul.appendChild(li);
}

function handleDelete(event) {
    const item = event.target.closest("li");
    const itemId = item.id;
    --count;
    localStorage.setItem("maxCount", count - 1);
    localStorage.removeItem(itemId);
    item.remove();
}

function handleEdit(event) {
    const obj = JSON.parse(localStorage.getItem(event.target.closest("li").id));
    add.amount.value = obj.amount;
    add.description.value = obj.description;
    add.category.value = obj.category;
    handleDelete(event);
}

