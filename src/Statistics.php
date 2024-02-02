<?php

class Statistics {

	private $pdo;
	private $tableName;

	function __construct(array $config){
		try{
			$this->pdo = new PDO("mysql:host={$dbConfig['host']};dbname={$dbConfig['name']}",$dbConfig['user'],$dbConfig['password']);

		    $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		    $this->pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
		}catch (Exception $e){
		    echo 'Error:' . $e->getMessage();
		}

		$this->tableName = mb_strtolower(get_class($this));

		$this->migrate();
	}

	public function save(string $statistics){
        try {
        	if($this->isJson($statistics)){
        		$statistics = json_decode($statistics, true);

	            $query = "insert into {$this->tableName} 
	            	(average, standartDeviation, fashion, min, max, lostQuotes, date, time, calculationTime) 
	                values
	                (:average, :standartDeviation, :fashion, :min, :max, :lostQuotes, :date, :time, :calculationTime)
	         	";

	            $query = $this->pdo->prepare($query);
	            $query->bindValue(':average', $statistics['average']);
	            $query->bindValue(':standartDeviation', $statistics['standartDeviation']);
	            $query->bindValue(':fashion', $statistics['fashion']);
	            $query->bindValue(':min', $statistics['min']);
	            $query->bindValue(':max', $statistics['max']);
	            $query->bindValue(':lostQuotes', $statistics['lostQuotes']);
	            $query->bindValue(':date', $statistics['date']);
	            $query->bindValue(':time', $statistics['time']);
	            $query->bindValue(':calculationTime', $statistics['calculationTime']);

	            $query->execute();
        	}
        } catch (Exception $e) {
            return '-1';
        }
	}

	public function show(){
		try {
		    $sql = "select * from {$this->tableName}";

		    $statisticsStatement = $this->pdo->query($sql);

		    return json_encode($statisticsStatement->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            return '-1';
        }
	}

	private function migrate(){
		try {
		    $query = "
		        create table if not exists {$this->tableName} (
		            id int auto_increment,
		            average float,
		            standartDeviation float,
		            fashion int,
		            min int,
		            max int,
		            lostQuotes int,
		            date varchar(200) not null,
		            time varchar(200) not null,
		            calculationTime varchar(200) not null,
		            primary key (id)
		        )
		    ";

		    $this->pdo->exec($query);
		} catch (Exception $e) {
		    echo 'Error:' . $e->getMessage();
		}
	}
	private function isJson($string){
		json_decode($string);
		return json_last_error() === JSON_ERROR_NONE;
	}
}