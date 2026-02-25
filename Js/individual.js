document.title = 'Individual Student';

const performanceTextPool = {
	yes: [
		'Just a few more minutes on my phone.',
		'I can scroll now and study later... probably.',
		'One more video will not hurt my grades, right?',
		'I keep telling myself I will start homework after this.'
	],
	no: [
		'I should get back to studying.',
		'Time to close this and finish my assignments.',
		'I can check my phone later after I complete my work.',
		'Let me focus first, then I can scroll.'
	]
};

let currentStudentUsageHours = '0';

document.addEventListener('DOMContentLoaded', () => {
	loadIndividualStudent();
	startTimeLimitOverlay();
});

function startTimeLimitOverlay() {
	const overlay = document.getElementById('time-limit-overlay');
	setTimeLimitMessage(currentStudentUsageHours);
	setIgnoreLimitTarget();

	if (!overlay) {
		return;
	}

	window.setTimeout(() => {
		overlay.classList.add('is-visible');
		overlay.setAttribute('aria-hidden', 'false');
	}, 10000);
}

function setTimeLimitMessage(usageHours) {
	const messageElement = document.getElementById('time-limit-message');

	if (!messageElement) {
		return;
	}

	messageElement.textContent = `You’ve reached your limit of ${usageHours} hours on phone.`;
}

function setIgnoreLimitTarget() {
	const ignoreLink = document.getElementById('time-limit-ignore');

	if (!ignoreLink) {
		return;
	}

	ignoreLink.href = `${window.location.pathname}${window.location.search}`;
}

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

		const mentalHealthScore = clampValue(Number(student.Mental_Health_Score) || 5, 1, 10);
		const affectsPerformance = (student.Affects_Academic_Performance || '').trim().toLowerCase();
		const thoughtText = getRandomPerformanceText(affectsPerformance);
		const glowSize = 300 + mentalHealthScore * 62;
		const pulseScale = 0.1 + mentalHealthScore * 0.02;
		const jitterAmount = 0.6 + mentalHealthScore * 0.26;
		const glowOpacity = 0.38 + mentalHealthScore * 0.06;
		const glowRgb = student.Gender.toLowerCase() === 'female' ? '216, 90, 208' : '41, 132, 255';
		const iconPath = getStudentIconPath(student);
		const fallbackIconPath = getGenderFallbackIconPath(student.Gender);
		currentStudentUsageHours = student.Avg_Daily_Usage_Hours || '0';
		setTimeLimitMessage(currentStudentUsageHours);

		card.style.setProperty('--glow-size', `${glowSize}px`);
		card.style.setProperty('--pulse-scale', pulseScale.toFixed(3));
		card.style.setProperty('--jitter', `${jitterAmount.toFixed(2)}px`);
		card.style.setProperty('--glow-opacity', glowOpacity.toFixed(2));
		card.style.setProperty('--glow-rgb', glowRgb);

		card.innerHTML = `
			<div class="focus-jitter">
				<div class="focus-core">
					<div class="focus-glow" aria-hidden="true"></div>
					<img class="focus-student" src="${iconPath}" alt="${student.Most_Used_Platform} ${student.Gender} student icon">
				</div>
			</div>
			<div class="student-meta">
				<h1>ID ${student.Student_ID}</h1>
				<p>Mental Health Score: ${student.Mental_Health_Score}</p>
				<p class="thought-text">"${thoughtText}"</p>
			</div>
		`;

		const focusImage = card.querySelector('.focus-student');
		if (focusImage) {
			focusImage.onerror = () => {
				if (focusImage.dataset.fallbackApplied === 'true') {
					return;
				}

				focusImage.dataset.fallbackApplied = 'true';
				focusImage.src = fallbackIconPath;
			};
		}
	} catch (error) {
		card.innerHTML = '<p>Unable to load student data.</p>';
	}
}

function getStudentIconPath(student) {
	const genderSuffix = (student.Gender || '').toLowerCase() === 'female' ? 'Female' : 'Male';
	const platformRaw = (student.Most_Used_Platform || '').trim();
	const platformFileMap = {
		YouTube: 'Youtube'
	};
	const platformBase = (platformFileMap[platformRaw] || platformRaw).replace(/\s+/g, '');

	if (!platformBase) {
		return getGenderFallbackIconPath(student.Gender);
	}

	return `../images/${platformBase}${genderSuffix}.png`;
}

function getGenderFallbackIconPath(gender) {
	return (gender || '').toLowerCase() === 'female' ? '../images/female.png' : '../images/male.png';
}

function getRandomPerformanceText(performanceValue) {
	const pool = performanceValue === 'yes' ? performanceTextPool.yes : performanceTextPool.no;
	const randomIndex = Math.floor(Math.random() * pool.length);
	return pool[randomIndex];
}

function clampValue(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
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
