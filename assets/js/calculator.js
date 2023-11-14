function calculate(){
	const price = input.get('purchase_price').gt(0).val();
	const closingCost = +input.get('closing_cost').val();
	//loan
	const useLoan = input.get('use-loan').checked().raw();
	const downPayment = +input.get('down_payment').val();
	const interest = +input.get('interest_rate').optional().gt(0).val();
	const years = +input.get('loan_term').optional().gt(0).val();

	//repair
	const needRepair = input.get('need-repair').checked().raw();
	const repairCost = +input.get('repair_cost').optional().gt(0).val();
	const afterRepair = input.get('after_repair').optional().gt('purchase_price').val();
	//income
	const rentalPrice = input.get('rental_price').gt(0).val();
	const priceIncrease = +input.get('annual_increase').optional().gt(0).val();
	const otherIncome = +input.get('other_income').optional().gt(0).val();
	const otherIncrease = +input.get('annual_increase_2').optional().gt(0).val();
	const vacancyRate = +input.get('vacancy_rate').optional().gt(0).val();
	const managementFee = +input.get('management_fee').optional().gt(0).val();

	//taxes
	const propertyTax = +input.get('property_tax').optional().gt(0).val();
	const taxIncrease = +input.get('annual_increase_3').optional().gt(0).val();
	const insurance = +input.get('total_insurance').optional().gt(0).val();
	const insuranceIncrease = +input.get('annual_increase_4').optional().gt(0).val();
	const hoa = +input.get('hoa_fee').optional().gt(0).val();
	const hoaIncrease = +input.get('annual_increase_5').optional().gt(0).val();
	const maintenance = +input.get('maintenance').optional().gt(0).val();
	const maintenanceIncrease = +input.get('annual_increase_6').optional().gt(0).val();
	const otherTaxes = +input.get('other_taxes').optional().gt(0).val();
	const otherTaxesIncrease = +input.get('annual_increase_7').optional().gt(0).val();
	//sell
	const knowSellingPrice = input.get('selling-price').checked().raw();
	const sellPriceIncrease = +input.get('value_appreciation').optional().gt(0).val();
	const sellingPrice = +input.get('selling_price').optional().gt(0).val();
	const holdingLength = input.get('holding_length').gt(0).val();
	const costSell = +input.get('cost_sell').optional().gt(0).val();

	if(useLoan) {
		if(!interest) {
			input.error('interest_rate', 'Please enter interest rate')
		}
		if(!years) {
			input.error('loan_term', 'Please enter loan term')
		}
	}
	if(needRepair) {
		if(!repairCost) {
			input.error('repair_cost', 'Please enter repair cost')
		}
		if(!afterRepair) {
			input.error('after_repair', 'Please enter value after repair')
		}
	}
	if(!input.valid()) return false;


	const loanValue = price - price * downPayment / 100;
	const mortgagePayment = !useLoan ? 0 : calculatePayment(loanValue, years * 12, interest);
	let yearMortgagePayment = mortgagePayment * 12;
	const monthlyIncome = rentalPrice - (rentalPrice) * (vacancyRate + managementFee) / 100;
	const monthlyOtherIncome = otherIncome - otherIncome * (vacancyRate + managementFee) / 100;
	let yearIncome = monthlyIncome * 12;
	let yearOtherIncome = monthlyOtherIncome * 12;
	let taxes = propertyTax + insurance + hoa + maintenance + otherTaxes;
	let cashFlow = yearIncome + yearOtherIncome - taxes - yearMortgagePayment;
	let beginCashFlow = 0;
	beginCashFlow -= closingCost;
	let propertySellPrice = price;
	let propertyCurrentValue = needRepair ? afterRepair : price;
	let propertyIncrement = sellPriceIncrease;

	if(needRepair) {
		beginCashFlow -= repairCost;
	}
	if(knowSellingPrice) {
		propertySellPrice = sellingPrice;
	}
	else {
		if(needRepair) {
			propertySellPrice = afterRepair;
		}
		propertySellPrice = propertySellPrice * Math.pow(1 + sellPriceIncrease / 100, holdingLength);
	}
	if(useLoan) {
		beginCashFlow -= price * downPayment / 100;
	}
	else {
		beginCashFlow -= price;
	}
	if(knowSellingPrice) {
		propertyIncrement = calculateInterestRate(propertySellPrice, propertyCurrentValue, 1, holdingLength);
	}
	let cashReturn = cashFlow / Math.abs(beginCashFlow) * 100;
	const amortization = calculateAmortization(loanValue, years * 12, interest);
	const principalPayment = useLoan ? getPrincipalForYear(amortization, 1) : 0;
	const interestPayments = calculateInterestValues(propertyCurrentValue, propertyIncrement, holdingLength);
	let propertyCost = (Math.abs(beginCashFlow) - closingCost) + interestPayments[0] +  principalPayment;
	let propertyCostPure = propertyCost - (propertyCost * costSell / 100);
	let result = [
		{
			yearIncome,
			yearOtherIncome,
			taxes,
			propertyTax,
			insurance,
			hoa,
			maintenance,
			otherTaxes,
			yearMortgagePayment,
			cashFlow,
			cashReturn,
			propertyCost,
			principalPayment,
			propertyCostPure
		}
	];

	for(let i = 1; i < holdingLength; i++) {
		if(i >= years) yearMortgagePayment = 0;
		let yearIncome = result[i - 1].yearIncome * (1 + priceIncrease / 100);
		let yearOtherIncome = result[i - 1].yearOtherIncome * (1 + otherIncrease / 100);
		let propertyTax = result[i - 1].propertyTax * (1 + taxIncrease / 100);
		let insurance = result[i - 1].insurance * (1 + insuranceIncrease / 100);
		let hoa = result[i - 1].hoa * (1 + hoaIncrease / 100);
		let maintenance = result[i - 1].maintenance * (1 + maintenanceIncrease / 100);
		let otherTaxes = result[i - 1].otherTaxes * (1 + otherTaxesIncrease / 100);
		let taxes = propertyTax + insurance + hoa + maintenance + otherTaxes;
		let cashFlow = yearIncome + yearOtherIncome - taxes - yearMortgagePayment;
		let cashReturn = cashFlow / Math.abs(beginCashFlow) * 100;

		let principalPayment = useLoan ? getPrincipalForYear(amortization, i + 1) : 0;
		let propertyCost = result[i - 1].propertyCost + interestPayments[i] + principalPayment;
		let propertyCostPure = propertyCost - (propertyCost * costSell / 100);
		if(i === holdingLength - 1){
			cashFlow = propertyCostPure + cashFlow;
		}

		result.push({
			yearIncome,
			yearOtherIncome,
			taxes,
			propertyTax,
			insurance,
			hoa,
			maintenance,
			otherTaxes,
			yearMortgagePayment,
			cashFlow,
			cashReturn,
			propertyCost,
			principalPayment,
			propertyCostPure
		});
	}

	const totalIncome = result.reduce((acc, item) => acc + item.yearIncome + item.yearOtherIncome, 0);
	const totalTaxes = result.reduce((acc, item) => acc + item.taxes, 0);

	let totalMortgage = result.reduce((acc, item) => acc + item.yearMortgagePayment, 0);
	if(years > holdingLength) {
		totalMortgage += calculateRemainder(loanValue, years * 12, interest, holdingLength * 12);
	}
	const totalProfit = totalIncome - totalTaxes - totalMortgage + propertySellPrice - propertySellPrice * costSell / 100 + beginCashFlow;
	const cashOnCash = totalProfit / Math.abs(beginCashFlow) * 100;
	const purchaseCap = (result[0].yearIncome + result[0].yearOtherIncome - result[0].taxes) / (price) * 100;
	const noi = totalIncome - totalTaxes;
	const cashFlows = result.map(item => item.cashFlow);
	cashFlows.unshift(beginCashFlow);
	const irr = calculateAnnualIRR(cashFlows);
	const mortgagePayments = result.reduce((acc, item) => acc + item.yearMortgagePayment, 0);

	const vacancy = (rentalPrice + otherIncome) * vacancyRate / 100;
	const management = (rentalPrice + otherIncome) * managementFee / 100;
	const firstYearCashFlow = result[0].cashFlow;
	output.val(roundTo(irr, 2) + '%').set('irr');
	output.val(currencyFormat(totalProfit)).set('total-profit');
	output.val(roundTo(cashOnCash, 2) + '%').set('cash-on-return');
	output.val(roundTo(purchaseCap, 2) + '%').set('cap-rate');
	output.val(currencyFormat(totalIncome)).set('total-income');
	output.val(currencyFormat(mortgagePayments)).set('total-mortgage');
	output.val(currencyFormat(totalTaxes)).set('total-expenses');
	output.val(currencyFormat(noi)).set('noi');
	output.val(currencyFormat(rentalPrice + otherIncome)).set('income-result-month');
	output.val(currencyFormat((rentalPrice + otherIncome) * 12)).set('income-result-annual');
	output.val(currencyFormat(mortgagePayment)).set('mortgage-result-month');
	output.val(currencyFormat(mortgagePayment * 12)).set('mortgage-result-annual');
	output.val(currencyFormat(vacancy)).set('vacancy-result-month');
	output.val(currencyFormat(vacancy * 12)).set('vacancy-result-annual');
	output.val(currencyFormat(management)).set('management-result-month');
	output.val(currencyFormat(management * 12)).set('management-result-annual');
	output.val(currencyFormat(propertyTax / 12)).set('property-tax-result-month');
	output.val(currencyFormat(propertyTax)).set('property-tax-result-annual');
	output.val(currencyFormat(insurance / 12)).set('insurance-result-month');
	output.val(currencyFormat(insurance)).set('insurance-result-annual');
	output.val(currencyFormat(hoa / 12)).set('hoa-result-month');
	output.val(currencyFormat(hoa)).set('hoa-result-annual');
	output.val(currencyFormat(maintenance / 12)).set('maintenance-result-month');
	output.val(currencyFormat(maintenance)).set('maintenance-result-annual');
	output.val(currencyFormat(otherTaxes / 12)).set('other-tax-result-month');
	output.val(currencyFormat(otherTaxes)).set('other-tax-result-annual');
	output.val(currencyFormat(firstYearCashFlow / 12)).set('cashflow-result-month');
	output.val(currencyFormat(firstYearCashFlow)).set('cashflow-result-annual');
	output.val(currencyFormat(firstYearCashFlow / 12 + mortgagePayment)).set('noi-result-month');
	output.val(currencyFormat(firstYearCashFlow + mortgagePayment * 12)).set('noi-result-annual');

	const totalTaxFees = propertyTax + insurance + hoa + maintenance + otherTaxes + vacancy + management + mortgagePayment * 12;
	const mortgagePercent = mortgagePayment * 12 / totalTaxFees * 100;
	const propertyTaxPercent = propertyTax / totalTaxFees * 100;
	const insurancePercent = insurance / totalTaxFees * 100;
	const hoaPercent = hoa / totalTaxFees * 100;
	const maintenancePercent = maintenance / totalTaxFees * 100;
	const otherTaxesPercent = otherTaxes / totalTaxFees * 100;
	const vacancyPercent = vacancy / totalTaxFees * 100;
	const managementPercent = management / totalTaxFees * 100;
	changeChartData([roundTo(mortgagePercent, 0), roundTo(vacancyPercent, 0), roundTo(managementPercent, 0), roundTo(propertyTaxPercent, 0), roundTo(insurancePercent, 0), roundTo(hoaPercent, 0), roundTo(maintenancePercent, 0), roundTo(otherTaxesPercent, 0)]);
}
function calculateInterestValues(price, rate, years){
	var balance = price;
	let result = [];
	for(let i = 0; i < years; i++) {
		let interest = balance * rate / 100;
		result.push(interest);
		balance += interest;
	}
	return result;
}

function calculateInterestRate(FV, PV, n, t) {
	if (FV <= PV) {
		return 0; // Loan amount is not growing, no interest.
	}

	const rate = n * (Math.pow(FV / PV, 1 / (n * t)) - 1);
	return rate * 100; // Convert to percentage.
}

function getPrincipalForYear(amortization, year){
	const array = amortization.slice((year - 1) * 12, year * 12);
	if(array.length === 0) return 0;
	return array.reduce((acc, item) => acc + item.paymentToPrinciple, 0);
}

function calculateAnnualIRR(cashFlows, iterations = 1000) {
	let lowerBound = -15.0;
	let upperBound = 15.0;
	let annualIRR = 0.0;

	for (let i = 0; i < iterations; i++) {
		annualIRR = (lowerBound + upperBound) / 2;
		let npv = 0;

		for (let j = 0; j < cashFlows.length; j++) {
			npv += cashFlows[j] / Math.pow(1 + annualIRR, j);
		}

		if (Math.abs(npv) < 0.00001) {
			return annualIRR * 100; // Convert to percentage
		} else if (npv > 0) {
			lowerBound = annualIRR;
		} else {
			upperBound = annualIRR;
		}
	}

	return 0; // If IRR cannot be found
}

function calculateRemainder(amount, months, interest, after){
	const amortization = calculateAmortization(amount, months, interest);
	if(amortization.length < after) return 0;
	return amortization[after - 1].principle;
}

function calculatePayment(finAmount, finMonths, finInterest){
	var result = 0;

	if(finInterest == 0){
		result = finAmount / finMonths;
	}
	else {
		var i = ((finInterest / 100) / 12),
			i_to_m = Math.pow((i + 1), finMonths),
			p = finAmount * ((i * i_to_m) / (i_to_m - 1));
		result = Math.round(p * 100) / 100;
	}

	return result;
}

function currencyFormat(num){
	return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function calculateAmortization(finAmount, finMonths, finInterest){
	var payment = calculatePayment(finAmount, finMonths, finInterest),
		balance = finAmount,
		interest = 0.0,
		totalInterest = 0.0,
		schedule = [],
		currInterest = null,
		currPrinciple = null

	for(var i=0; i<finMonths; i++){
		currInterest = balance * finInterest/1200;
		totalInterest += currInterest;
		currPrinciple = payment - currInterest;
		balance -= currPrinciple;

		schedule.push({
			principle: balance,
			interest: totalInterest,
			payment: payment,
			paymentToPrinciple: currPrinciple,
			paymentToInterest: currInterest,
		});
	}

	return schedule;
}
