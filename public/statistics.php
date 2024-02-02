<?php

require_once '../config/db.php';
require_once '../src/Statistics.php';

$statistics = new Statistics($dbConfig);

switch($_SERVER['REQUEST_METHOD']){
    case 'GET': $request = $statistics->show(); break;
    case 'POST': $request = $statistics->save($_POST['statistics']); break;
}

echo $request;