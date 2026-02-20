<?php
$correct_user = 'admin';
$correct_pass = '12345';

if ($_POST['username'] == $correct_user && $_POST['password'] == $correct_pass) {
    echo "OK";
} else {
    echo "FAIL";
}
?>
