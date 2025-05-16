<?php
$conn = new mysqli("localhost", "root", "", "pos_system");
$data = json_decode(file_get_contents("php://input"), true);
$cart = $data['cart'] ?? [];

if (count($cart) > 0) {
    $conn->query("INSERT INTO transactions () VALUES ()");
    $transaction_id = $conn->insert_id;

    foreach ($cart as $item) {
        $stmt = $conn->prepare("INSERT INTO transaction_items (transaction_id, product_code, product_name, price) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isss", $transaction_id, $item['code'], $item['name'], $item['price']);
        $stmt->execute();
    }

    echo "Thanh toán thành công! Mã hóa đơn: $transaction_id";
} else {
    echo "Giỏ hàng trống!";
}
?>
