/* 
********************************
DO NOT CHANGE THE CODE BELOW.
IF YOU HAVE ANY ISSUES, LET ME KNOW.
I'M OPEN TO SUGGESTIONS

MADE BY LUCAS OLIVEIRA 
********************************
*/
console.log('new version');`"~±`
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAgents() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwBsan6864RGFuxEBy3ik2PVvRKrLJIEJWzklKD-uRcStQdo2fEobCfwBxaNq5z9qd3/exec');
        const data = await response.json();
        
        // Use data directly as it is already the agents array
        if (Array.isArray(data)) {
            return data;
        } else {
            console.error("Unexpected data format", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching agents:", error);
        return [];
    }
}

async function processRows() {
    const agents = await fetchAgents(); // Fetch agents from API

    if (!Array.isArray(agents) || agents.length === 0) {
        console.error("No agents data available.");
        return;
    }

    await sleep(5000); // Wait 5 seconds before continuing

    const rows = document.querySelectorAll(".custom-dashboard-table-row");
    const activeAgents = [];
    let unassignedTicketCount = 0;

    rows.forEach(function(row) {
        
        if (row.childNodes[2]) {
            let agentIdentifier = row.childNodes[2].textContent.trim();

            if (agentIdentifier == '-') {
                unassignedTicketCount++; // add +1 to unassigned ticket
                return;
            }

            // Find the agent in the agents array
            let agentObject = agents.find(agent => agent.agent === agentIdentifier);

            if (agentObject) { // If agent is found in the agents array
                let minutesPassed = Number(row.childNodes[5].textContent.split(':')[0]);
                let ticketTitle = row.childNodes[1].textContent;
                let ticketURL = row.childNodes[1].childNodes[0].href;
                let time = row.childNodes[5].textContent;
                let backgroundColor = '';

                if (minutesPassed > 4 && minutesPassed < 10) {
                    backgroundColor = '#E8F0FE'; // Light blue for mild indication
                } else if (minutesPassed > 9 && minutesPassed < 16) {
                    backgroundColor = '#FFF9C4'; // Light yellow for attention
                } else if (minutesPassed > 15) {
                    backgroundColor = '#FFCDD2'; // Light red for alert
                } else {
                    backgroundColor = '#FFFFFF'; // White for default
                }

                activeAgents.push({ 
                    agentIdentifier, 
                    team: agentObject.team, 
                    ticketTitle, 
                    ticketURL, 
                    time, 
                    minutesPassed, 
                    backgroundColor 
                });
            }
        }
    });

    // Adicionar unassignedTicketCount ao objeto activeAgents
    activeAgents.unassignedTicketCount = unassignedTicketCount;

    // Sort in descending order based on minutesPassed
    activeAgents.sort((a, b) => b.minutesPassed - a.minutesPassed);

    createAndInsertElements(activeAgents);
}

function createAndInsertElements(activeAgents) {
    // Create a container div
    const containerDiv = document.createElement("div");
    containerDiv.style.padding = "20px";
    containerDiv.style.backgroundColor = "#ffffff";
    containerDiv.style.borderRadius = "8px";
    containerDiv.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
    containerDiv.style.marginBottom = "20px";
    containerDiv.style.marginTop = "2rem";

    // Create the dropdown and insert it into the containerDiv
    const dropdown = createDropdownFilter(activeAgents);
    containerDiv.appendChild(dropdown);

    // Create the table and insert it into the containerDiv
    const table = createAgentsTable(activeAgents);
    containerDiv.appendChild(table);

    // Create the agents and tickets count and insert it into the containerDiv
    const countDiv = createCountDiv(activeAgents);
    containerDiv.appendChild(countDiv);

    // Create and insert the team count tags into the containerDiv
    const teamTags = createTeamTags(activeAgents, dropdown);
    containerDiv.appendChild(teamTags);

    // Select the parent element
    const parentElement = document.querySelector("#root > div > div.pb-10.px-4.m-auto");

    // Insert the containerDiv as the first child of the parentElement
    parentElement.insertBefore(containerDiv, parentElement.firstChild);
}

function createDropdownFilter(activeAgents) {
    const dropdown = document.createElement("select");
    dropdown.id = 'teamDropdown';
    dropdown.style.marginBottom = "20px";
    dropdown.style.display = "block"; // Ensures it is on a separate line
    dropdown.style.padding = "12px";
    dropdown.style.borderRadius = "4px";
    dropdown.style.border = "1px solid #CCCCCC";
    dropdown.style.backgroundColor = "#FFFFFF";
    dropdown.style.color = "#333333";
    dropdown.style.fontFamily = "Arial, sans-serif";
    dropdown.style.fontSize = "14px";

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All";
    dropdown.appendChild(allOption);

    const teams = new Set(activeAgents.map(agent => agent.team));
    teams.forEach(team => {
        const option = document.createElement("option");
        option.value = team;
        option.textContent = team;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener("change", function() {
        filterTableByTeam(dropdown.value);
    });

    return dropdown;
}

function createAgentsTable(activeAgents) {
    // Create the table and the header, and assign a unique ID to the table
    const table = document.createElement("table");
    table.id = 'customAgentsTable'; // Unique ID for our table
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Table header
    const headerRow = document.createElement("tr");
    const headers = ["Agent", "Team", "Ticket", "Time"];
    headers.forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        th.style.padding = '12px';
        th.style.textAlign = 'left';
        th.style.backgroundColor = '#F5F5F5';
        th.style.color = '#333333';
        th.style.fontWeight = "bold";
        th.style.borderBottom = '2px solid #DDDDDD';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create the table rows
    activeAgents.forEach(({ agentIdentifier, team, ticketTitle, ticketURL, time, backgroundColor }) => {
        const row = document.createElement("tr");
        row.style.backgroundColor = backgroundColor;

        const agentCell = document.createElement("td");
        agentCell.textContent = agentIdentifier; // Agent's name
        agentCell.style.padding = '12px';
        agentCell.style.borderBottom = '1px solid #DDDDDD';
        row.appendChild(agentCell);

        const teamCell = document.createElement("td");
        teamCell.textContent = team; // Agent's team
        teamCell.style.padding = '12px';
        teamCell.style.borderBottom = '1px solid #DDDDDD';
        row.appendChild(teamCell);

        const ticketCell = document.createElement("td");
        const link = document.createElement("a");
        link.href = ticketURL;
        link.textContent = ticketTitle;
        link.style.textDecoration = 'none';
        link.style.color = '#007BFF'; // Blue for links
        link.style.fontWeight = 'bold';
        link.target = "_blank"; // Opens the link in a new tab
        ticketCell.appendChild(link);
        ticketCell.style.padding = '12px';
        ticketCell.style.borderBottom = '1px solid #DDDDDD';
        row.appendChild(ticketCell);

        const timeCell = document.createElement("td");
        timeCell.textContent = time;
        timeCell.style.padding = '12px';
        timeCell.style.borderBottom = '1px solid #DDDDDD';
        row.appendChild(timeCell);

        tbody.appendChild(row);
    });

    // Assemble the table
    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
}

function createCountDiv(activeAgents) {
    // Create the agents and tickets count
    const countDiv = document.createElement("div");
    countDiv.textContent = `Total Assigned: ${activeAgents.length} | Total Unassigned: ${activeAgents.unassignedTicketCount}`;
    countDiv.style.marginTop = '20px';
    countDiv.style.fontWeight = 'bold';
    countDiv.style.fontSize = '14px';
    countDiv.style.color = "#333333";
    countDiv.style.cursor = "pointer";
    countDiv.style.padding = "10px";
    countDiv.style.borderRadius = "4px";
    countDiv.style.backgroundColor = "#F5F5F5";
    countDiv.style.border = "1px solid #DDDDDD";

    // Add event to reset filtering when clicked
    countDiv.addEventListener("click", function() {
        document.getElementById('teamDropdown').value = "";
        filterTableByTeam("");
    });

    return countDiv;
}

function createTeamTags(activeAgents, dropdown) {
    const teams = {};

    // Count the occurrence of each team
    activeAgents.forEach(agent => {
        teams[agent.team] = (teams[agent.team] || 0) + 1;
    });

    // Convert the teams object into an array and sort it by count in descending order
    const sortedTeams = Object.entries(teams).sort((a, b) => b[1] - a[1]);

    const tagsDiv = document.createElement("div");
    tagsDiv.style.marginTop = "20px";
    tagsDiv.style.display = "flex";
    tagsDiv.style.flexWrap = "wrap";

    // Pastel and soft colors for the tags
    const colors = [
        "#F1F3F4", "#E9EBEE", "#DADDE1", "#CBD3D8", "#EBEDF0", 
        "#F4F5F7", "#FAFAFA", "#ECEEF1", "#F6F7F8", "#E0E2E4"
    ];
    let colorIndex = 0;

    // Create a tag for each team, sorted by count
    sortedTeams.forEach(([team, count]) => {
        const tag = document.createElement("span");
        tag.textContent = `${team}: ${count}`;
        tag.style.backgroundColor = colors[colorIndex % colors.length];
        tag.style.color = "#333333";
        tag.style.padding = "8px 16px";
        tag.style.marginRight = "10px";
        tag.style.marginBottom = "10px";
        tag.style.borderRadius = "20px";
        tag.style.fontWeight = "bold";
        tag.style.cursor = "pointer"; // Makes the tag clickable
        tag.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";

        // Add the event listener to filter when the tag is clicked
        tag.addEventListener("click", function() {
            dropdown.value = team; // Update the dropdown
            filterTableByTeam(team);
        });

        tagsDiv.appendChild(tag);
        colorIndex++;
    });

    return tagsDiv;
}


function filterTableByTeam(selectedTeam) {
    const rows = document.querySelectorAll("#customAgentsTable tbody tr");

    rows.forEach(row => {
        const teamCell = row.querySelector("td:nth-child(2)"); // Select the team cell
        if (selectedTeam === "" || (teamCell && teamCell.textContent === selectedTeam)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

processRows();