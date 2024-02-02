class QuoteEngine {
	constructor(link){
		this.quotes = [];

		this.link = link;

		this.lastId = null;
		this.lostQuotes = 0;

		this.numberOfQuotes = 0;

		this.calculationStartTime = 0;
	}

	connect(link){
		return new WebSocket(link);
	}

	onMessage(e){
		if(this.numberOfQuotes < 2) {
			this.lastId = null;
			return;
		}

		if(this.calculationStartTime == 0) this.calculationStartTime = Date.now();

		const quotation = JSON.parse(e.data);

		if(this.lastId && this.lastId+1 != quotation.id) this.lostQuotes++;

		this.lastId = quotation.id;

		this.quotes.push(quotation.value);

		if(!(this.quotes.length % this.numberOfQuotes)) this.sendStatistics();
	}

	msToTime(duration) {
		let milliseconds = parseInt((duration % 1000) / 100),
		    seconds = parseInt((duration / 1000) % 60),
		    minutes = parseInt((duration / (1000 * 60)) % 60),
		    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;

		return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
	}

	sendStatistics(){
		const body = new FormData();
		body.append('statistics', JSON.stringify(this.getStatisticalValues()));

		fetch(this.link, { method: 'POST', body });
	}

	async getStatistics(){
		return await (await fetch(this.link)).json();
	}

	setNumberOfQuotes(e, setNumberIsValid){
		const number = Number(e.target.value),
			  numberIsValid = !isNaN(number) && typeof number == 'number';

		this.numberOfQuotes = numberIsValid ? number : 0;

		setNumberIsValid(numberIsValid && number >= 2);
	}

	getStatisticalValues(){
		const now = new Date(this.calculationStartTime);

		const average = this.getAverage(),
			  standartDeviation = this.getStandartDeviation(average),
			  fashion = this.getFashion(),
			  lostQuotes = this.lostQuotes,
			  min = this.getMinOfArray(this.quotes),
			  max = this.getMaxOfArray(this.quotes),
			  date = now.toLocaleDateString('en-US'), 
			  time = now.toLocaleTimeString('en-US'),
			  calculationTime = this.msToTime(Date.now() - this.calculationStartTime);

		return { average, standartDeviation, fashion, min, max, lostQuotes, date, time, calculationTime };
	}

	getAverage(){
		return Math.floor(this.quotes.reduce((a, b) => a + b, 0) / this.quotes.length * 100) / 100;
	}
	getStandartDeviation(average){
		return Math.floor(Math.sqrt(this.quotes.map(quote => Math.pow(quote-average, 2)).reduce((a, b) => a + b, 0) / this.quotes.length) * 100) / 100;
	}
	getFashion(){
		let quantity = 0, maxQuote = 0, quantityMoreThanOne = false;

		const counter = this.quotes.reduce((counter, quote) => {
			counter[quote] = counter[quote] ? counter[quote]+1 : 1;
			if(counter[quote] != 1) quantityMoreThanOne = !quantityMoreThanOne;
			return counter;
		}, {});

		if(!quantityMoreThanOne) return this.getMaxOfArray(this.quotes);

		for(let key in counter) if(counter[key] > quantity){
			quantity = counter[key];
			maxQuote = key;
		}

		return Number(maxQuote);
	}
	getMaxOfArray(arr){
		return Math.max.apply(null, arr);
	}
	getMinOfArray(arr){
		return Math.min.apply(null, arr);
	}
}