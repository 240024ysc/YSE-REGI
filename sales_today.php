<?php
$conn = new mysqli("localhost", "root", "", "pos_system");
$conn->set_charset("utf8");

$today = date("Y-m-d");

$sql = "SELECT t.id, t.created_at, SUM(i.price) as total
        FROM transactions t
        JOIN transaction_items i ON t.id = i.transaction_id
        WHERE DATE(t.created_at) = '$today'
        GROUP BY t.id, t.created_at
        ORDER BY t.created_at DESC";

$result = $conn->query($sql);
$data = [];

$total_sales = 0;

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
    $total_sales += $row['total'];
}

echo json_encode([
    "records" => $data,
    "total" => $total_sales
]);
