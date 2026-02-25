document.title = 'Graduate';

const pageConfig = {
	academicLevel: 'Graduate',
	featured: [
		{ label: 'Most addicted-like', id: 676 },
		{ label: 'Middle / moderate', id: 643 },
		{ label: 'Least addicted-like', id: 7 }
	]
};

document.addEventListener('DOMContentLoaded', () => {
	setupCustomCursor();
	loadPageData();
});

async function loadPageData() {
	const iconWall = document.getElementById('icon-wall');

	if (!iconWall) {
		return;
	}

	try {
		const response = await fetch('../Data/StudentsSocialMediaAddiction.csv');
		const csvText = await response.text();
		const students = parseCsv(csvText);

		const selectedStudents = selectGridStudents(students, pageConfig);
		renderIconWall(iconWall, selectedStudents, pageConfig.featured, pageConfig.academicLevel);
	} catch (error) {
		iconWall.innerHTML = '';
	}
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

function selectGridStudents(students, config) {
	const levelStudents = students.filter((student) => student.Academic_Level === config.academicLevel);
	const selectedIds = [];
	const selectedStudents = [];

	config.featured.forEach((featuredStudent) => {
		const found = levelStudents.find((student) => Number(student.Student_ID) === featuredStudent.id);
		if (found && !selectedIds.includes(found.Student_ID)) {
			selectedIds.push(found.Student_ID);
			selectedStudents.push(found);
		}
	});

	for (const student of levelStudents) {
		if (selectedStudents.length >= 15) {
			break;
		}

		if (!selectedIds.includes(student.Student_ID)) {
			selectedIds.push(student.Student_ID);
			selectedStudents.push(student);
		}
	}

	return selectedStudents;
}

function renderIconWall(container, selectedStudents, featuredList, academicLevel) {
	const highlightIdSet = new Set(featuredList.map((item) => String(item.id)));
	const randomizedStudents = shuffleStudents([...selectedStudents]);

	container.innerHTML = '';

	randomizedStudents.forEach((student) => {
		const iconPath = getStudentIconPath(student);
		const fallbackIconPath = getGenderFallbackIconPath(student.Gender);
		const icon = document.createElement('img');
		icon.src = iconPath;
		icon.alt = `${student.Most_Used_Platform} ${student.Gender} icon`;
		icon.className = 'wall-person';
		icon.onerror = () => {
			if (icon.dataset.fallbackApplied === 'true') {
				return;
			}

			icon.dataset.fallbackApplied = 'true';
			icon.src = fallbackIconPath;
		};

		if (highlightIdSet.has(student.Student_ID)) {
			icon.classList.add('is-highlight');
			const link = document.createElement('a');
			link.className = 'wall-person-link';
			link.href = `individual.html?id=${encodeURIComponent(student.Student_ID)}&level=${encodeURIComponent(academicLevel)}`;
			link.setAttribute('aria-label', `View student ${student.Student_ID}`);
			link.appendChild(icon);
			container.appendChild(link);
			return;
		}

		container.appendChild(icon);
	});
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

function shuffleStudents(students) {
	for (let index = students.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[students[index], students[randomIndex]] = [students[randomIndex], students[index]];
	}

	return students;
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