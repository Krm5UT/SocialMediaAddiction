document.title = 'Individual Student';

const countryCodeMap = {
	Afghanistan: 'AF',
	Albania: 'AL',
	Andorra: 'AD',
	Argentina: 'AR',
	Armenia: 'AM',
	Australia: 'AU',
	Austria: 'AT',
	Azerbaijan: 'AZ',
	Bahamas: 'BS',
	Bahrain: 'BH',
	Bangladesh: 'BD',
	Belarus: 'BY',
	Belgium: 'BE',
	Bhutan: 'BT',
	Bolivia: 'BO',
	Bosnia: 'BA',
	Brazil: 'BR',
	Bulgaria: 'BG',
	Canada: 'CA',
	Chile: 'CL',
	China: 'CN',
	Colombia: 'CO',
	'Costa Rica': 'CR',
	Croatia: 'HR',
	Cyprus: 'CY',
	'Czech Republic': 'CZ',
	Denmark: 'DK',
	Ecuador: 'EC',
	Egypt: 'EG',
	Estonia: 'EE',
	Finland: 'FI',
	France: 'FR',
	Georgia: 'GE',
	Germany: 'DE',
	Ghana: 'GH',
	Greece: 'GR',
	'Hong Kong': 'HK',
	Hungary: 'HU',
	Iceland: 'IS',
	India: 'IN',
	Indonesia: 'ID',
	Iraq: 'IQ',
	Ireland: 'IE',
	Israel: 'IL',
	Italy: 'IT',
	Jamaica: 'JM',
	Japan: 'JP',
	Jordan: 'JO',
	Kazakhstan: 'KZ',
	Kenya: 'KE',
	Kosovo: 'XK',
	Kuwait: 'KW',
	Kyrgyzstan: 'KG',
	Latvia: 'LV',
	Lebanon: 'LB',
	Liechtenstein: 'LI',
	Lithuania: 'LT',
	Luxembourg: 'LU',
	Malaysia: 'MY',
	Maldives: 'MV',
	Malta: 'MT',
	Mexico: 'MX',
	Moldova: 'MD',
	Monaco: 'MC',
	Montenegro: 'ME',
	Morocco: 'MA',
	Nepal: 'NP',
	Netherlands: 'NL',
	'New Zealand': 'NZ',
	Nigeria: 'NG',
	'North Macedonia': 'MK',
	Norway: 'NO',
	Oman: 'OM',
	Pakistan: 'PK',
	Panama: 'PA',
	Paraguay: 'PY',
	Peru: 'PE',
	Philippines: 'PH',
	Poland: 'PL',
	Portugal: 'PT',
	Qatar: 'QA',
	Romania: 'RO',
	Russia: 'RU',
	'San Marino': 'SM',
	Serbia: 'RS',
	Singapore: 'SG',
	Slovakia: 'SK',
	Slovenia: 'SI',
	'South Africa': 'ZA',
	'South Korea': 'KR',
	Spain: 'ES',
	'Sri Lanka': 'LK',
	Sweden: 'SE',
	Switzerland: 'CH',
	Syria: 'SY',
	Taiwan: 'TW',
	Tajikistan: 'TJ',
	Thailand: 'TH',
	Trinidad: 'TT',
	Turkey: 'TR',
	UAE: 'AE',
	UK: 'GB',
	Ukraine: 'UA',
	Uruguay: 'UY',
	USA: 'US',
	Uzbekistan: 'UZ',
	'Vatican City': 'VA',
	Venezuela: 'VE',
	Vietnam: 'VN',
	Yemen: 'YE'
};

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
		const motionProfile = getMentalHealthMotionProfile(mentalHealthScore);
		const affectsPerformance = (student.Affects_Academic_Performance || '').trim().toLowerCase();
		const thoughtText = getRandomPerformanceText(affectsPerformance);
		const glowSize = 300 + mentalHealthScore * 62;
		const pulseScale = motionProfile.pulseScale;
		const jitterAmount = motionProfile.jitterAmount;
		const glowOpacity = 0.38 + mentalHealthScore * 0.06;
		const glowRgb = student.Gender.toLowerCase() === 'female' ? '216, 90, 208' : '41, 132, 255';
		const iconPath = getStudentIconPath(student);
		const fallbackIconPath = getGenderFallbackIconPath(student.Gender);
		const countryCode = getCountryCode(student.Country);
		const nationalityFlagUrl = countryCode ? `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png` : '';
		const age = student.Age || 'N/A';
		const addictedScore = student.Addicted_Score || '0';
		const sleepHours = student.Sleep_Hours_Per_Night || '0';
		currentStudentUsageHours = student.Avg_Daily_Usage_Hours || '0';
		setTimeLimitMessage(currentStudentUsageHours);

		card.style.setProperty('--glow-size', `${glowSize}px`);
		card.style.setProperty('--pulse-scale', pulseScale.toFixed(3));
		card.style.setProperty('--jitter', `${jitterAmount.toFixed(2)}px`);
		card.style.setProperty('--jitter-duration', motionProfile.jitterDuration);
		card.style.setProperty('--icon-glitch-duration', motionProfile.iconGlitchDuration);
		card.style.setProperty('--glow-opacity', glowOpacity.toFixed(2));
		card.style.setProperty('--glow-rgb', glowRgb);

		card.innerHTML = `
			<div class="student-flag" aria-label="Nationality ${student.Country}" title="${student.Country}">
				${
					nationalityFlagUrl
						? `<img class="student-flag-image" src="${nationalityFlagUrl}" alt="${student.Country} flag" loading="lazy">`
						: '<span class="student-flag-fallback">🏳️</span>'
				}
			</div>
			<div class="phone-shell" aria-hidden="true">
				<img class="phone-frame" src="../images/phoneoutline.png" alt="">
				<div class="outside-notifications">
					<div class="message-notification message-notification-1">"${thoughtText}"</div>
					<div class="message-notification message-notification-2">Addicted Score: ${addictedScore}</div>
					<div class="message-notification message-notification-3">Sleep: ${sleepHours} hrs/night</div>
					<div class="message-notification message-notification-4">Age: ${age}</div>
				</div>
				<div class="phone-screen">
					<div class="focus-jitter">
						<div class="focus-core">
							<div class="focus-glow" aria-hidden="true"></div>
							<img class="focus-student" src="${iconPath}" alt="${student.Most_Used_Platform} ${student.Gender} student icon">
						</div>
					</div>
				</div>
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

		const flagImage = card.querySelector('.student-flag-image');
		if (flagImage) {
			flagImage.onerror = () => {
				const flagContainer = card.querySelector('.student-flag');
				if (!flagContainer) {
					return;
				}

				flagContainer.innerHTML = '<span class="student-flag-fallback">🏳️</span>';
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
		youtube: 'Youtube',
		line: 'Line'
	};
	const normalizedPlatform = platformRaw.toLowerCase();
	const platformBase = (platformFileMap[normalizedPlatform] || platformRaw).replace(/\s+/g, '');

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

function getMentalHealthMotionProfile(score) {
	if (score <= 3) {
		return {
			jitterAmount: 4.4,
			jitterDuration: '85ms',
			iconGlitchDuration: '0.95s',
			pulseScale: 0.3
		};
	}

	if (score <= 6) {
		return {
			jitterAmount: 2.9,
			jitterDuration: '120ms',
			iconGlitchDuration: '1.3s',
			pulseScale: 0.24
		};
	}

	return {
		jitterAmount: 0.8,
		jitterDuration: '220ms',
		iconGlitchDuration: '2.2s',
		pulseScale: 0.12
	};
}

function getCountryCode(countryName) {
	const isoCode = countryCodeMap[(countryName || '').trim()];

	if (!isoCode) {
		return '';
	}

	return isoCode.toUpperCase();
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
