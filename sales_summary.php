<?php
$conn = new mysqli("localhost", "root", "", "pos_system");
$conn->set_charset("utf8");

// Lấy các giao dịch trong 7 ngày gần nhất (bạn có thể đổi)
$sql = "SELECT t.id, t.created_at, SUM(i.price) AS total
        FROM transactions t
        JOIN transaction_items i ON t.id = i.transaction_id
        WHERE t.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY t.id, t.created_at
        ORDER BY t.created_at DESC";

$result = $conn->query($sql);

$data_by_day = [];

while ($row = $result->fetch_assoc()) {
    $date = date("Y-m-d", strtotime($row['created_at']));
    if (!isset($data_by_day[$date])) {
        $data_by_day[$date] = [
            "transactions" => [],
            "total" => 0
        ];
    }
    $data_by_day[$date]["transactions"][] = [
        "id" => $row["id"],
        "created_at" => date("H:i", strtotime($row["created_at"])),
        "total" => $row["total"]
    ];
    $data_by_day[$date]["total"] += $row["total"];
}

echo json_encode($data_by_day);
