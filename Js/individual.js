document.title = 'Individual Student';

document.addEventListener('DOMContentLoaded', () => {
	setupCustomCursor();
	loadIndividualStudent();
});

async function loadIndividualStudent() {
	const card = document.getElementById('individual-card');
	const backLink = document.getElementById('back-link');
	const params = new URLSearchParams(window.location.search);
	const studentId = params.get('id');
	const level = params.get('level') || '';

	if (!card) {
		return;
	}

	if (backLink) {
		backLink.href = getBackHref(level);
	}

	if (!studentId) {
		card.innerHTML = '<p>Student not found.</p>';
		return;
	}

	try {
		const response = await fetch('../Data/StudentsSocialMediaAddiction.csv');
		const csvText = await response.text();
		const students = parseCsv(csvText);
		const student = students.find((entry) => entry.Student_ID === studentId);

		if (!student) {
			card.innerHTML = '<p>Student not found.</p>';
			return;
		}

		const iconPath = student.Gender.toLowerCase() === 'female' ? '../images/female.png' : '../images/male.png';
		card.innerHTML = `
			<img src="${iconPath}" alt="${student.Gender} student icon">
			<h1>ID ${student.Student_ID}</h1>
			<p>Academic Level: ${student.Academic_Level}</p>
			<p>Gender: ${student.Gender}</p>
			<p>Usage: ${student.Avg_Daily_Usage_Hours}h/day</p>
			<p>Sleep: ${student.Sleep_Hours_Per_Night}h</p>
			<p>Addicted Score: ${student.Addicted_Score}</p>
			<p>Conflicts: ${student.Conflicts_Over_Social_Media}</p>
			<p>Academics Affected: ${student.Affects_Academic_Performance}</p>
		`;
	} catch (error) {
		card.innerHTML = '<p>Unable to load student data.</p>';
	}
}

function getBackHref(level) {
	if (level === 'Undergraduate') {
		return 'undergrad.html';
	}

	if (level === 'Graduate') {
		return 'graduate.html';
	}

	if (level === 'High School') {
		return 'highschool.html';
	}

	return '../index.html';
}

function parseCsv(csvText) {
	const lines = csvText.trim().split(/\r?\n/);
	const headers = lines[0].split(',');

	return lines.slice(1).map((line) => {
		const values = line.split(',');
		const student = {};

		headers.forEach((header, index) => {
			student[header] = values[index];
		});

		return student;
	});
}

function setupCustomCursor() {
	const customCursorElement = document.createElement('div');
	customCursorElement.className = 'custom-cursor';
	customCursorElement.innerHTML = '<div class="custom-cursor-outer"></div><div class="custom-cursor-inner"></div>';
	document.body.appendChild(customCursorElement);

	const updateCursorPosition = (event) => {
		customCursorElement.style.left = `${event.clientX}px`;
		customCursorElement.style.top = `${event.clientY}px`;
		customCursorElement.style.opacity = '1';
	};

	window.addEventListener('mousemove', updateCursorPosition);
	window.addEventListener('mousedown', () => customCursorElement.classList.add('is-down'));
	window.addEventListener('mouseup', () => customCursorElement.classList.remove('is-down'));
	window.addEventListener('mouseleave', () => {
		customCursorElement.style.opacity = '0';
	});
}
