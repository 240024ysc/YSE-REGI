<?php
$conn = new mysqli("localhost", "root", "", "pos_system");
$conn->set_charset("utf8");

$date = $_GET['date'];

$sql = "SELECT t.id, t.created_at, SUM(i.price) AS total
        FROM transactions t
        JOIN transaction_items i ON t.id = i.transaction_id
        WHERE DATE(t.created_at) = ?
        GROUP BY t.id
        ORDER BY t.created_at ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $date);
$stmt->execute();
$result = $stmt->get_result();

$data = [
    "transactions" => [],
    "total" => 0
];

while ($row = $result->fetch_assoc()) {
    $data["transactions"][] = [
        "id" => $row["id"],
        "time" => date("H:i", strtotime($row["created_at"])),
        "total" => $row["total"]
    ];
    $data["total"] += $row["total"];
}

echo json_encode($data);
