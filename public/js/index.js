const { useEffect, useState, Fragment } = React, 
	  quoteEngine = new QuoteEngine('http://localhost/statistics.php');

function App(){
	const [ socket, setSocket ] = useState(null),
		  [ statistics, setStatistics ] = useState(null),
		  [ numberOfQuotes, setNumberOfQuotes ] = useState(0),
		  [ numberIsValid, setNumberIsValid ] = useState(true);

	useEffect(() => {
		const socket = quoteEngine.connect('wss://trade.termplat.com:8800/?password=1234');

		socket.onopen = () => setSocket(socket);

		socket.onmessage = e => {
			quoteEngine.onMessage(e);
			setNumberOfQuotes(quoteEngine.quotes.length);
		};
	}, []);

	const onChangeInput = e => quoteEngine.setNumberOfQuotes(e, setNumberIsValid);
	const onGetStatistics = async () => {
		const statistics = await quoteEngine.getStatistics();
		setStatistics(statistics);
	}

	return (
		<Fragment>
			{socket ? (
				<Fragment>
					<header>
						<input type="text" placeholder="Введите количество котировок" className={ !numberIsValid ? 'decline' : undefined } onChange={onChangeInput} />
						<button onClick={onGetStatistics}>Статистика</button>
					</header>
					{statistics ? (
						<ul>
						{statistics.map((statisticalValue, i) => i === 0 && numberOfQuotes > 0 ? <StatisticalBlock key='first' statistics={quoteEngine.getStatisticalValues()} /> : <StatisticalBlock key={statisticalValue.id} statistics={statisticalValue} />)}
						</ul>
					) : (
						<div>Получено котировок: {numberOfQuotes}</div>
					)}
				</Fragment>
			) : (
				<div>Ожидание подключения...</div>
			)}
		</Fragment>
	);
}

function StatisticalBlock({statistics: {average, standartDeviation, fashion, min, max, lostQuotes, date, time, calculationTime}}){
	return (
		<li>
			<span>Арифметическое среднее: {average}</span>
			<span>Стандратное отклонение: {standartDeviation}</span>
			<span>Мода: {fashion}</span>
			<span>Минимальное значение: {min}</span>
			<span>Максимальное значение: {max}</span>
			<span>Кол-во потерянных котировок: {lostQuotes}</span>
			<span>Дата/время запуска расчетов: {date}/{time}</span>
			<span>Время потраченное на расчеты: {calculationTime}</span>
		</li>
	);
}

const root = ReactDOM.createRoot(document.getElementById("app"));

root.render(
	<App />
);