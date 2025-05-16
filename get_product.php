<?php
$conn = new mysqli("localhost", "root", "", "pos_system");
$code = $_GET['code'] ?? '';
$stmt = $conn->prepare("SELECT * FROM products WHERE code = ?");
$stmt->bind_param("s", $code);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(["success" => true, "product" => $row]);
} else {
    echo json_encode(["success" => false]);
}
?>
