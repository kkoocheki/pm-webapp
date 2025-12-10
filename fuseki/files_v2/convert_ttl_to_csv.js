const fs = require('fs');
const path = require('path');

// Read the TTL file
const ttlContent = fs.readFileSync(path.join(__dirname, 'example_project_scrum_aligned_v2.ttl'), 'utf-8');

// Parse TTL - handle multi-line properties
const triples = [];
let currentSubject = null;
const lines = ttlContent.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();

  // Skip comments and empty lines
  if (!line || line.startsWith('#') || line.startsWith('@prefix')) continue;

  // Handle lines starting with ex: (new subject)
  if (line.startsWith('ex:')) {
    // Extract subject, predicate, object
    const match = line.match(/^(ex:\S+)\s+([\w:]+)\s+(.+)$/);
    if (match) {
      currentSubject = match[1];
      const predicate = match[2];
      let object = match[3];

      // Remove trailing semicolon, period, or comma
      object = object.replace(/[;,.]$/, '').trim();

      triples.push({ subject: currentSubject, predicate, object });
    }
  }
  // Handle continuation lines (indented properties)
  else if (currentSubject && line.match(/^\s*[\w:]+\s+/)) {
    const match = line.match(/^\s*([\w:]+)\s+(.+)$/);
    if (match) {
      const predicate = match[1];
      let object = match[2];

      // Remove trailing semicolon, period, or comma
      object = object.replace(/[;,.]$/, '').trim();

      triples.push({ subject: currentSubject, predicate, object });
    }
  }
}

console.log(`Parsed ${triples.length} triples from TTL file`);

// Helper to get object value (clean quotes, language tags, etc.)
const cleanValue = (value) => {
  if (!value) return '';
  // Handle URI references
  if (value.startsWith('ex:') || value.startsWith('sro:') || value.startsWith('pm:') || value.startsWith('eo:')) {
    return value;
  }
  // Handle literals with datatype or language tags
  return value
    .replace(/^"(.+)"@\w+$/, '$1')
    .replace(/^"(.+)"\^\^.+$/, '$1')
    .replace(/^"(.+)"$/, '$1')
    .replace(/\\"/g, '"');
};

// Helper to get all values for a subject-predicate pair
const getValues = (subject, predicate) => {
  return triples
    .filter(t => t.subject === subject && t.predicate === predicate)
    .map(t => cleanValue(t.object));
};

// Helper to get single value
const getValue = (subject, predicate) => {
  const values = getValues(subject, predicate);
  return values.length > 0 ? values[0] : '';
};

// Get all subjects of a certain type
const getSubjectsOfType = (type) => {
  return triples
    .filter(t => t.predicate === 'a' && t.object === type)
    .map(t => t.subject);
};

// Map priority values
const mapPriority = (priority) => {
  const priorityMap = {
    'sro:Urgent': 'Urgent',
    'sro:High': 'High',
    'sro:Medium': 'Medium',
    'sro:Low': 'Low'
  };
  return priorityMap[priority] || 'Medium';
};

// Map status values
const mapStatusToLinear = (status) => {
  const statusMap = {
    'sro:Done': 'Completed',
    'sro:InProgress': 'In Progress',
    'sro:InReview': 'In Review',
    'sro:ToDo': 'Backlog'
  };
  return statusMap[status] || 'Backlog';
};

const mapStatusToJira = (status) => {
  const statusMap = {
    'sro:Done': 'Done',
    'sro:InProgress': 'In Progress',
    'sro:InReview': 'In Review',
    'sro:ToDo': 'To Do'
  };
  return statusMap[status] || 'To Do';
};

// Format date for Linear (e.g., "Sat Nov 08 2025 16:43:09 GMT+0000 (GMT)")
const formatDateLinear = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${dayName} ${monthName} ${day} ${year} ${hours}:${minutes}:${seconds} GMT+0000 (GMT)`;
  } catch (e) {
    return '';
  }
};

// Format date for Jira (e.g., "18/Oct/25 9:32 AM")
const formatDateJira = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${day}/${month}/${year} ${displayHours}:${minutes} ${ampm}`;
  } catch (e) {
    return '';
  }
};

// Generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Build Linear CSV
const buildLinearCSV = () => {
  const headers = [
    'ID', 'Team', 'Title', 'Description', 'Status', 'Estimate', 'Priority',
    'Project ID', 'Project', 'Creator', 'Assignee', 'Labels', 'Cycle Number',
    'Cycle Name', 'Cycle Start', 'Cycle End', 'Created', 'Updated', 'Started',
    'Triaged', 'Completed', 'Canceled', 'Archived', 'Due Date', 'Parent issue',
    'Initiatives', 'Project Milestone ID', 'Project Milestone', 'SLA Status', 'UUID'
  ];

  const rows = [];
  const projectId = 'f288f480-e45c-4718-960b-80f48a997e1b';
  const projectName = getValue('ex:ProjectAlpha', 'eo:name') || 'Alpha Platform Development';
  const team = 'Alpha Team';

  // Get all epics
  const epics = getSubjectsOfType('sro:Epic');
  const epicMap = new Map();

  console.log(`Found ${epics.length} epics`);

  let idCounter = 1;

  epics.forEach(epic => {
    const epicId = `ALP-${idCounter++}`;
    epicMap.set(epic, epicId);

    const row = {
      'ID': epicId,
      'Team': team,
      'Title': getValue(epic, 'eo:name') || getValue(epic, 'rdfs:label'),
      'Description': getValue(epic, 'eo:description'),
      'Status': 'Backlog',
      'Estimate': '',
      'Priority': mapPriority(getValue(epic, 'sro:hasPriority')),
      'Project ID': projectId,
      'Project': projectName,
      'Creator': 'alice.chen@example.org',
      'Assignee': '',
      'Labels': '',
      'Cycle Number': '',
      'Cycle Name': '',
      'Cycle Start': '',
      'Cycle End': '',
      'Created': formatDateLinear(getValue(epic, 'pm:hasPlannedStart')),
      'Updated': formatDateLinear(getValue(epic, 'pm:hasPlannedStart')),
      'Started': '',
      'Triaged': '',
      'Completed': '',
      'Canceled': '',
      'Archived': '',
      'Due Date': formatDateLinear(getValue(epic, 'pm:hasPlannedEnd')),
      'Parent issue': '',
      'Initiatives': '',
      'Project Milestone ID': '',
      'Project Milestone': '',
      'SLA Status': '',
      'UUID': generateUUID()
    };
    rows.push(row);
  });

  // Get all user stories
  const stories = getSubjectsOfType('sro:UserStory');
  console.log(`Found ${stories.length} user stories`);

  stories.forEach(story => {
    const storyId = `ALP-${idCounter++}`;
    const parentEpic = getValue(story, 'pm:hasParent');
    const sprint = getValue(story, 'sro:isInSprint');
    const sprintNum = sprint ? getValue(sprint, 'sro:sprintNumber') : '';
    const sprintName = sprint ? getValue(sprint, 'eo:name') : '';
    const sprintStart = sprint ? getValue(sprint, 'pm:hasPlannedStart') : '';
    const sprintEnd = sprint ? getValue(sprint, 'pm:hasPlannedEnd') : '';
    const assignee = getValue(story, 'pm:assignedTo');
    const assigneeEmail = assignee ? getValue(assignee, 'eo:email') : '';
    const status = getValue(story, 'sro:hasState');
    const created = getValue(story, 'pm:hasPlannedStart');
    const started = getValue(story, 'pm:hasActualStart');
    const completed = getValue(story, 'pm:hasActualEnd');

    const row = {
      'ID': storyId,
      'Team': team,
      'Title': getValue(story, 'eo:name') || getValue(story, 'rdfs:label'),
      'Description': getValue(story, 'sro:storyText'),
      'Status': mapStatusToLinear(status),
      'Estimate': getValue(story, 'sro:storyPoints'),
      'Priority': mapPriority(getValue(story, 'sro:hasPriority')),
      'Project ID': projectId,
      'Project': projectName,
      'Creator': 'alice.chen@example.org',
      'Assignee': assigneeEmail,
      'Labels': '',
      'Cycle Number': sprintNum,
      'Cycle Name': sprintName,
      'Cycle Start': formatDateLinear(sprintStart),
      'Cycle End': formatDateLinear(sprintEnd),
      'Created': formatDateLinear(created),
      'Updated': formatDateLinear(created),
      'Started': started ? formatDateLinear(started) : '',
      'Triaged': '',
      'Completed': completed ? formatDateLinear(completed) : '',
      'Canceled': '',
      'Archived': '',
      'Due Date': formatDateLinear(getValue(story, 'pm:hasPlannedEnd')),
      'Parent issue': parentEpic ? epicMap.get(parentEpic) || '' : '',
      'Initiatives': '',
      'Project Milestone ID': '',
      'Project Milestone': '',
      'SLA Status': '',
      'UUID': generateUUID()
    };
    rows.push(row);
  });

  console.log(`Generated ${rows.length} rows for Linear CSV`);

  // Convert to CSV
  const csvRows = [headers.map(h => `"${h}"`).join(',')];
  rows.forEach(row => {
    const values = headers.map(h => {
      const value = row[h] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

// Build Jira CSV
const buildJiraCSV = () => {
  const headers = [
    'Summary', 'Issue key', 'Issue id', 'Issue Type', 'Status', 'Project key', 'Project name',
    'Project type', 'Project lead', 'Project lead id', 'Project description', 'Priority',
    'Resolution', 'Assignee', 'Assignee Id', 'Reporter', 'Reporter Id', 'Creator',
    'Creator Id', 'Created', 'Updated', 'Last Viewed', 'Resolved', 'Due date', 'Votes',
    'Description', 'Environment', 'Watchers', 'Watchers Id', 'Original estimate',
    'Remaining Estimate', 'Time Spent', 'Work Ratio', 'Σ Original Estimate',
    'Σ Remaining Estimate', 'Σ Time Spent', 'Security Level', 'Inward issue link (Blocks)',
    'Inward issue link (Blocks)', 'Outward issue link (Blocks)', 'Custom field (Development)',
    'Custom field (Issue color)', 'Custom field (Rank)', 'Sprint', 'Custom field (Start date)',
    'Custom field (Story point estimate)', 'Custom field (Team)', 'Custom field (Vulnerability)',
    'Custom field (Vulnerability)', 'Parent', 'Parent key', 'Parent summary', 'Status Category',
    'Status Category Changed'
  ];

  const rows = [];
  const projectKey = 'ALPHA';
  const projectName = getValue('ex:ProjectAlpha', 'eo:name') || 'Alpha Platform Development';
  const projectDesc = getValue('ex:ProjectAlpha', 'eo:description') || 'Scrum project for developing the Alpha customer platform';
  const projectLead = 'Alice Chen';
  const projectLeadId = '712020:b4a55964-bc07-41e3-aff2-aa429d3932cd';

  let issueIdCounter = 10000;
  let issueKeyCounter = 1;

  // Get all epics
  const epics = getSubjectsOfType('sro:Epic');
  const epicMap = new Map();

  console.log(`Found ${epics.length} epics for Jira`);

  epics.forEach((epic, index) => {
    const epicKey = `${projectKey}-${issueKeyCounter++}`;
    const epicId = issueIdCounter++;
    const epicName = getValue(epic, 'eo:name') || getValue(epic, 'rdfs:label');
    epicMap.set(epic, { key: epicKey, id: epicId, summary: epicName });

    const row = {
      'Summary': epicName,
      'Issue key': epicKey,
      'Issue id': String(epicId),
      'Issue Type': 'Epic',
      'Status': 'Idea',
      'Project key': projectKey,
      'Project name': projectName,
      'Project type': 'software',
      'Project lead': projectLead,
      'Project lead id': projectLeadId,
      'Project description': projectDesc,
      'Priority': mapPriority(getValue(epic, 'sro:hasPriority')),
      'Resolution': '',
      'Assignee': '',
      'Assignee Id': '',
      'Reporter': projectLead,
      'Reporter Id': projectLeadId,
      'Creator': projectLead,
      'Creator Id': projectLeadId,
      'Created': formatDateJira(getValue(epic, 'pm:hasPlannedStart')),
      'Updated': formatDateJira(getValue(epic, 'pm:hasPlannedStart')),
      'Last Viewed': '',
      'Resolved': '',
      'Due date': formatDateJira(getValue(epic, 'pm:hasPlannedEnd')),
      'Votes': '0',
      'Description': getValue(epic, 'eo:description'),
      'Environment': '',
      'Watchers': projectLead,
      'Watchers Id': projectLeadId,
      'Original estimate': '',
      'Remaining Estimate': '',
      'Time Spent': '',
      'Work Ratio': '',
      'Σ Original Estimate': '',
      'Σ Remaining Estimate': '',
      'Σ Time Spent': '',
      'Security Level': '',
      'Inward issue link (Blocks)': '',
      'Inward issue link (Blocks)': '',
      'Outward issue link (Blocks)': '',
      'Custom field (Development)': '',
      'Custom field (Issue color)': 'purple',
      'Custom field (Rank)': `0|i${String(10000 + index).padStart(5, '0')}:`,
      'Sprint': '',
      'Custom field (Start date)': formatDateJira(getValue(epic, 'pm:hasPlannedStart')),
      'Custom field (Story point estimate)': '',
      'Custom field (Team)': '',
      'Custom field (Vulnerability)': '',
      'Custom field (Vulnerability)': '',
      'Parent': '',
      'Parent key': '',
      'Parent summary': '',
      'Status Category': 'To Do',
      'Status Category Changed': formatDateJira(getValue(epic, 'pm:hasPlannedStart'))
    };
    rows.push(row);
  });

  // Get all user stories
  const stories = getSubjectsOfType('sro:UserStory');
  console.log(`Found ${stories.length} user stories for Jira`);

  stories.forEach((story, index) => {
    const storyKey = `${projectKey}-${issueKeyCounter++}`;
    const storyId = issueIdCounter++;
    const parentEpic = getValue(story, 'pm:hasParent');
    const parentInfo = parentEpic ? epicMap.get(parentEpic) : null;
    const sprint = getValue(story, 'sro:isInSprint');
    const sprintName = sprint ? getValue(sprint, 'eo:name') : '';
    const assignee = getValue(story, 'pm:assignedTo');
    const assigneeName = assignee ? getValue(assignee, 'eo:name') : '';
    const status = getValue(story, 'sro:hasState');
    const created = getValue(story, 'pm:hasPlannedStart');
    const started = getValue(story, 'pm:hasActualStart');

    const statusCategory = status === 'sro:Done' ? 'Done' : (status === 'sro:InProgress' || status === 'sro:InReview' ? 'In Progress' : 'To Do');

    const row = {
      'Summary': getValue(story, 'eo:name') || getValue(story, 'rdfs:label'),
      'Issue key': storyKey,
      'Issue id': String(storyId),
      'Issue Type': 'Story',
      'Status': mapStatusToJira(status),
      'Project key': projectKey,
      'Project name': projectName,
      'Project type': 'software',
      'Project lead': projectLead,
      'Project lead id': projectLeadId,
      'Project description': projectDesc,
      'Priority': mapPriority(getValue(story, 'sro:hasPriority')),
      'Resolution': '',
      'Assignee': assigneeName,
      'Assignee Id': assigneeName ? projectLeadId : '',
      'Reporter': projectLead,
      'Reporter Id': projectLeadId,
      'Creator': projectLead,
      'Creator Id': projectLeadId,
      'Created': formatDateJira(created),
      'Updated': formatDateJira(created),
      'Last Viewed': formatDateJira(created),
      'Resolved': '',
      'Due date': formatDateJira(getValue(story, 'pm:hasPlannedEnd')),
      'Votes': '0',
      'Description': getValue(story, 'sro:storyText'),
      'Environment': '',
      'Watchers': projectLead,
      'Watchers Id': projectLeadId,
      'Original estimate': '',
      'Remaining Estimate': '',
      'Time Spent': '',
      'Work Ratio': '',
      'Σ Original Estimate': '',
      'Σ Remaining Estimate': '',
      'Σ Time Spent': '',
      'Security Level': '',
      'Inward issue link (Blocks)': '',
      'Inward issue link (Blocks)': '',
      'Outward issue link (Blocks)': '',
      'Custom field (Development)': '',
      'Custom field (Issue color)': '',
      'Custom field (Rank)': `0|i${String(20000 + index).padStart(5, '0')}:`,
      'Sprint': sprintName,
      'Custom field (Start date)': started ? formatDateJira(started) : '',
      'Custom field (Story point estimate)': getValue(story, 'sro:storyPoints'),
      'Custom field (Team)': '',
      'Custom field (Vulnerability)': '',
      'Custom field (Vulnerability)': '',
      'Parent': parentInfo ? String(parentInfo.id) : '',
      'Parent key': parentInfo ? parentInfo.key : '',
      'Parent summary': parentInfo ? parentInfo.summary : '',
      'Status Category': statusCategory,
      'Status Category Changed': formatDateJira(created)
    };
    rows.push(row);
  });

  console.log(`Generated ${rows.length} rows for Jira CSV`);

  // Convert to CSV
  const csvRows = [headers.join(',')];
  rows.forEach(row => {
    const values = headers.map(h => {
      const value = row[h] || '';
      const str = String(value);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

// Generate CSVs
console.log('\nGenerating Linear CSV...');
const linearCSV = buildLinearCSV();

console.log('\nGenerating Jira CSV...');
const jiraCSV = buildJiraCSV();

// Write to files
fs.writeFileSync(path.join(__dirname, 'import-export', 'Alpha_Project_Linear_Export.csv'), linearCSV, 'utf-8');
fs.writeFileSync(path.join(__dirname, 'import-export', 'Alpha_Project_Jira_Export.csv'), jiraCSV, 'utf-8');

console.log('\n✓ CSV files generated successfully!');
console.log('  - Alpha_Project_Linear_Export.csv');
console.log('  - Alpha_Project_Jira_Export.csv');
