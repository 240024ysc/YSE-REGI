let cart = [];

function addProduct() {
    const code = document.getElementById('product_code').value;
    fetch(`get_product.php?code=${code}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Kiểm tra xem sản phẩm đã có chưa
                const existing = cart.find(p => p.code === data.product.code);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    cart.push({ ...data.product, quantity: 1 });
                }
                renderCart();
            } else {
                alert('商品を見つけない!');
            }
        });
    document.getElementById('product_code').value = '';
}

let includeTax = false;

function toggleTax() {
    includeTax = !includeTax;
    renderCart();
}

function renderCart() {
    const tbody = document.querySelector('#cart_table tbody');
    tbody.innerHTML = '';
    let total = 0;
    cart.forEach((p, index) => {
        const price = parseFloat(p.price);
        const itemTotal = price * p.quantity;
        total += itemTotal;

        tbody.innerHTML += `<tr>
            <td>${p.code}</td>
            <td>${p.name}</td>
            <td>
                ${price.toLocaleString()} 円 x 
                ${p.quantity}
                <button onclick="changeQty(${index}, 1)">＋</button>
                <button onclick="changeQty(${index}, -1)">－</button>
                <button onclick="removeItem(${index})">🗑</button>
            </td>
        </tr>`;
    });

    let totalDisplay = total;
    if (includeTax) {
        totalDisplay *= 1.1; // Thuế 10%
    }

    document.getElementById('total').innerText =
        '合計: ' + totalDisplay.toLocaleString() + ' 円' + (includeTax ? ' (税込)' : '');
}
function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1); // Xóa nếu số lượng <= 0
    }
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
}


function checkout() {
    if (cart.length === 0) {
        alert("Chưa có sản phẩm nào!");
        return;
    }

    fetch('checkout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
    }).then(res => res.text())
        .then(msg => {
            alert(msg);

            // Hiển thị hóa đơn
            const invoiceBox = document.getElementById('invoice');
            const itemsBox = document.getElementById('invoice_items');
            const totalBox = document.getElementById('invoice_total');

            let html = "<ul>";
            let total = 0;
            cart.forEach(p => {
                total += parseFloat(p.price);
                html += `<li>${p.name}: ${parseFloat(p.price).toLocaleString()} 円</li>`;
            });
            html += "</ul>";

            let totalWithTax = includeTax ? total * 1.1 : total;

            itemsBox.innerHTML = html;
            totalBox.innerText = "合計: " + totalWithTax.toLocaleString() + " 円" + (includeTax ? "" : "");

            invoiceBox.style.display = 'block';

            // Reset giỏ hàng
            cart = [];
            renderCart();
        });
}
function goBack() {
    document.getElementById('invoice').style.display = 'none';
    cart = [];
    renderCart();
}
function showDailySales() {
    fetch("sales_summary.php")
        .then(res => res.json())
        .then(data => {
            let html = "";
            const sortedDates = Object.keys(data).sort().reverse(); // ngày mới trước

            sortedDates.forEach(date => {
                html += `<h3 style="margin-top:20px;">📅 ${date}</h3>`;
                html += "<table style='width:100%; border-collapse: collapse;'>"
                    + "<tr style='background:#f0f0f0;'>"
                    + "<th style='padding:8px; border-bottom:1px solid #ccc;'>日時</th>"
                    + "<th style='padding:8px; border-bottom:1px solid #ccc;'>取引番号</th>"
                    + "<th style='padding:8px; border-bottom:1px solid #ccc;'>金額合計</th>"
                    + "</tr>";

                data[date].transactions.forEach(tx => {
                    html += `<tr>
                        <td style='padding:8px; border-bottom:1px solid #eee;'>${tx.created_at}</td>
                        <td style='padding:8px; border-bottom:1px solid #eee;'>#${tx.id}</td>
                        <td style='padding:8px; border-bottom:1px solid #eee;'>${parseFloat(tx.total).toLocaleString()} 円</td>
                    </tr>`;
                });

                html += `<tr style="font-weight:bold;"><td colspan="2">合計日 ${date}</td>
                         <td>${parseFloat(data[date].total).toLocaleString()} 円</td></tr>`;

                html += "</table>";
            });

            document.getElementById("sales_table").innerHTML = html;
            document.getElementById("sales_total").innerHTML = ""; // không cần tổng tất cả nữa
            document.getElementById("sales_report_overlay").style.display = "flex";
        });
}
function closeSales() {
    document.getElementById("sales_report_overlay").style.display = "none";
}
function loadSalesByDate() {
    const date = document.getElementById("selected_date").value;
    if (!date) {
        alert("選んでください！");
        return;
    }

    fetch(`sales_by_date.php?date=${date}`)
        .then(res => res.json())
        .then(data => {
            let html = `<h3 style="margin-top:20px;">📅 ${date}</h3>`;
            if (data.transactions.length === 0) {
                html += "<p>本日には取引がありません!!</p>";
            } else {
                html += "<table style='width:100%; border-collapse: collapse;'>"
                    + "<tr style='background:#f0f0f0;'>"
                    + "<th style='padding:8px; border-bottom:1px solid #ccc;'>日時</th>"
                    + "<th style='padding:8px; border-bottom:1px solid #ccc;'>取引番号</th>"
                    + "<th style='padding:8px; border-bottom:1px solid #ccc;'>金額合計</th>"
                    + "</tr>";

                data.transactions.forEach(tx => {
                    html += `<tr>
                        <td style='padding:8px; border-bottom:1px solid #eee;'>${tx.time}</td>
                        <td style='padding:8px; border-bottom:1px solid #eee;'>#${tx.id}</td>
                        <td style='padding:8px; border-bottom:1px solid #eee;'>${parseFloat(tx.total).toLocaleString()} 円</td>
                    </tr>`;
                });

                html += `<tr style="font-weight:bold;"><td colspan="2">合計日 ${date}</td>
                         <td>${parseFloat(data.total).toLocaleString()} VND</td></tr>`;

                html += "</table>";
            }

            document.getElementById("sales_table").innerHTML = html;
            document.getElementById("sales_total").innerHTML = "";
            document.getElementById("sales_report_overlay").style.display = "flex";
        });
}