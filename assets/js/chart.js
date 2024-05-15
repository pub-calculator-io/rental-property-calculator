// CHART_DONUT_BIG
'use strict'

let switchTheme = null;
let theme = 'light';
if (localStorage.getItem('theme') === 'dark' || (localStorage.getItem('theme') === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) theme = 'dark';

const colors = {
	light: {
		purple: '#A78BFA',
		yellow: '#FBBF24',
		sky: '#7DD3FC',
		blue: '#1D4ED8',
		pink: '#DB2777',
		red: '#3D1D1D',
		green: '#059669',
		indigo: '#5045E5',
		teal: '#2DD4BF',
		textColor: '#6B7280',
		yellowGradientStart: 'rgba(250, 219, 139, 0.33)',
		purpleGradientStart: 'rgba(104, 56, 248, 0.16)',
		skyGradientStart: 'rgba(56, 187, 248, 0.16)',
		tealGradientStart: 'rgba(56, 248, 222, 0.16)',
		yellowGradientStop: 'rgba(250, 219, 139, 0)',
		purpleGradientStop: 'rgba(104, 56, 248, 0)',
		gridColor: '#DBEAFE',
		tooltipBackground: '#fff',
		fractionColor: '#EDE9FE',
	},
	dark: {
		purple: '#7C3AED',
		yellow: '#D97706',
		sky: '#0284C7',
		blue: '#101E47',
		pink: '#DB2777',
		red: '#3D1D1D',
		green: '#059669',
		indigo: '#5045E5',
		teal: '#2DD4BF',
		textColor: '#fff',
		yellowGradientStart: 'rgba(146, 123, 67, 0.23)',
		purpleGradientStart: 'rgba(78, 55, 144, 0.11)',
		skyGradientStart: 'rgba(56, 187, 248, 0.16)',
		tealGradientStart: 'rgba(56, 248, 222, 0.16)',
		yellowGradientStop: 'rgba(250, 219, 139, 0)',
		purpleGradientStop: 'rgba(104, 56, 248, 0)',
		gridColor: '#162B64',
		tooltipBackground: '#1C3782',
		fractionColor: '#41467D',
	},
};

let data = [
	{
		data: [65, 1, 0, 14, 7, 0, 11, 2],
		labels: ['65%', '1%', '0%', '14%', '7%', '0%', '11%', '2%'],
		backgroundColor: [colors[theme].yellow, colors[theme].purple, colors[theme].red, colors[theme].green, colors[theme].indigo, colors[theme].sky, colors[theme].pink, colors[theme].teal],
		borderColor: '#DDD6FE',
		borderWidth: 0,
	},
];

let options = {
	rotation: 0,
	cutout: '37%',
	hover: {mode: null},
	responsive: false,
	layout: {
		padding: 30,
	},
	plugins: {
		tooltip: {
			enabled: false,
			position: 'average'
		},
		legend: {
			display: false,
		},
	},
};

const customDataLabels = {
	id: 'customDataLabel',
	afterDatasetDraw(chart, args, pluginOptions) {
		const {
			ctx,
			data,
			chartArea: { top, bottom, left, right, width, height },
		} = chart;
		ctx.save();

		data.datasets[0].data.forEach((datapoint, index) => {
			const { x, y } = chart.getDatasetMeta(0).data[index].tooltipPosition();
			ctx.textAlign = 'center';
			ctx.font = '14px Inter';
			ctx.fillStyle = '#fff';
			ctx.textBaseline = 'middle';
			let toolTipText = datapoint != '0' ? datapoint + '%' : '';
			ctx.fillText(toolTipText, x, y);
		});
	},
};

let donutBig = new Chart(document.getElementById('chartDonutBigger'), {
	type: 'doughnut',
	data: {
		datasets: data,
	},
	options: options,
	plugins: [customDataLabels],
});

switchTheme = function(theme) {
	donutBig.destroy()

	const customDataLabels = {
		id: 'customDataLabel',
		afterDatasetDraw(chart, args, pluginOptions) {
			const {
				ctx,
				data,
				chartArea: { top, bottom, left, right, width, height },
			} = chart;
			ctx.save();

			data.datasets[0].data.forEach((datapoint, index) => {
				const { x, y } = chart.getDatasetMeta(0).data[index].tooltipPosition();
				ctx.textAlign = 'center';
				ctx.font = '14px Inter';
				ctx.fillStyle = '#fff';
				ctx.textBaseline = 'middle';
				let toolTipText = datapoint != '0' ? datapoint + '%' : '';
				ctx.fillText(toolTipText, x, y);
			});
		},
	};

	donutBig = new Chart(document.getElementById('chartDonutBigger'), {
		type: 'doughnut',
		data: {
			datasets: data,
		},
		options: options,
		plugins: [customDataLabels],
	});

	donutBig.data.datasets[0].backgroundColor = [colors[theme].yellow, colors[theme].purple, colors[theme].red, colors[theme].green, colors[theme].indigo, colors[theme].sky, colors[theme].pink, colors[theme].teal];
	donutBig.update()
}

window.changeChartData = function(values) {
	donutBig.data.datasets[0].data = values
	donutBig.data.datasets[0].labels = values.map(value =>  `${value}%`)
	donutBig.update()
}
