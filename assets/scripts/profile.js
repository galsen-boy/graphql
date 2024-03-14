import { fetchData } from "./graphqlFetcher.js";
import { displayBasicUserData, displayData } from "./displayHelper.js";
import { shuffleArray } from "./utils.js";

document.addEventListener("DOMContentLoaded", async function () {
  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    window.location.href = "index.html";
  }

  try {
    // ******************* Query basic user Identification ************************* //
    const responseData = await fetchData(
      jwt,
      `{
        user {
          id
          firstName
          lastName
          createdAt
        }
      }`
    );
    const userData = responseData.data.user;
    displayBasicUserData(userData);

    // ***************************** Query XP Amount ****************************** //
    const xpdiv01 = await fetchData(
      jwt,
      `{
        event_user(where: {userId: {_eq: ${userData[0].id}}} limit: 1) {
          user {
            transactions_aggregate(
              where: {type: {_eq: "xp"}, _and: {event: {object: {id: {_eq: 100256}}}}}
            ) {
              aggregate {
                sum {
                  amount
                }
              }
            }
          }
        }
      }`
    );

    displayData(
      "xpDiv01Amount",
      Math.round(
        xpdiv01.data.event_user[0].user.transactions_aggregate.aggregate.sum
          .amount / 1000
      )
    );

    // ******************************** Query Levels ****************************** //
    const div01LevelResponse = await fetchData(
      jwt,
      `{
          event_user(where: { event: { path: { _ilike: "/dakar/div-01"}}}, order_by: { user: { login: asc}}, limit: 1) {
            level
        }
      }`
    );

    const div01Level = div01LevelResponse.data.event_user[0].level;
    displayData("div01Level", div01Level);

    // ***************************** Query Audits ********************************* //
    const auditsResponse = await fetchData(
      jwt,
      `{
        user {
          auditRatio
          totalUp
          totalDown
        }
      }`
    );

    const auditRatio = auditsResponse.data.user[0].auditRatio.toFixed(2);
    const auditDone = Math.round(auditsResponse.data.user[0].totalUp / 1000);
    const auditReceived = Math.round(
      auditsResponse.data.user[0].totalDown / 1000
    );

    displayData("auditRatio", auditRatio);
    displayData("auditDone", auditDone);
    displayData("auditReceived", auditReceived);

    // ******************************** Query Projects ****************************** //
    const projectsResponse = await fetchData(
      jwt,
      `{
        transaction(
          where: { type: {_eq: "xp"}, event: {path: {_eq: "/dakar/div-01"}}, path: {_nlike: "%checkpoint%", _nilike: "%piscine-js%"}}
        ) {
          amount
          path
        }
      }`
    );
    const projects = projectsResponse.data.transaction;

    displayData("projects", projects.length);

    const transaction = projectsResponse.data.transaction;
    const topTenProjects = transaction
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
    const shuffledTopTenProjects = shuffleArray(topTenProjects);

    // Create svg container
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "800");

    // Create bars
    for (let i = 0; i < shuffledTopTenProjects.length; i++) {
      let bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bar.setAttribute("x", i * 30);
      bar.setAttribute("y", 700 - shuffledTopTenProjects[i].amount / 300);
      bar.setAttribute("width", "25");
      bar.setAttribute("height", shuffledTopTenProjects[i].amount / 300);
      bar.setAttribute("fill", "green");

      // Add interactivity
      bar.addEventListener("mouseover", () => {
        bar.setAttribute("fill", "white");

        // Show project name above the bar
        let textBelow = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        textBelow.setAttribute("x", i * 30);
        textBelow.setAttribute("y", 720);
        textBelow.setAttribute("fill", "white");
        textBelow.textContent = shuffledTopTenProjects[i].path.split("/").pop();
        svg.appendChild(textBelow);

        // Show amount of xp above the bar
        let textAbove = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        textAbove.setAttribute("x", i * 30);
        textAbove.setAttribute("y", 740);
        textAbove.setAttribute("fill", "green");
        textAbove.textContent =
          (shuffledTopTenProjects[i].amount / 1000).toFixed(2) + "KB xp";
        svg.appendChild(textAbove);
      });

      // Reset on mouseout
      bar.addEventListener("mouseout", () => {
        bar.setAttribute("fill", "green");

        // Remove texts
        svg.querySelectorAll("text").forEach((text) => {
          svg.removeChild(text);
        });
      });
      svg.appendChild(bar);
    }

    document.getElementById("graph").appendChild(svg);

    // *************************** Create Circular (Pie Chart) Graph ****************************** //
    const totalAudit = auditDone + auditReceived;
    const radius = 150;
    const center = { x: 250, y: 300 };

    // Calculate angles
    const angleAuditDone = (auditDone / totalAudit) * 360;
    const angleAuditReceived = (auditReceived / totalAudit) * 360;

    // Create SVG container for pie chart
    const pieChartSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    pieChartSVG.setAttribute("id", "pieChart");
    pieChartSVG.setAttribute("width", "100%");
    pieChartSVG.setAttribute("height", "800");

    // Function to create arc path
    const createArcPath = (startAngle, endAngle) => {
      const startX =
        center.x + radius * Math.cos((startAngle - 90) * (Math.PI / 180));
      const startY =
        center.y + radius * Math.sin((startAngle - 90) * (Math.PI / 180));
      const endX =
        center.x + radius * Math.cos((endAngle - 90) * (Math.PI / 180));
      const endY =
        center.y + radius * Math.sin((endAngle - 90) * (Math.PI / 180));

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      return `M ${center.x} ${center.y} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    };

    // Create auditDone arc
    const pathAuditDone = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathAuditDone.setAttribute("d", createArcPath(0, angleAuditDone));
    pathAuditDone.setAttribute("fill", "green");
    pathAuditDone.setAttribute(
      "transform",
      "rotate(-90 " + center.x + " " + center.y + ")"
    );
    pieChartSVG.appendChild(pathAuditDone);

    // Create auditReceived arc
    const pathAuditReceived = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathAuditReceived.setAttribute(
      "d",
      createArcPath(angleAuditDone, angleAuditDone + angleAuditReceived)
    );
    pathAuditReceived.setAttribute("fill", "red");
    pathAuditReceived.setAttribute(
      "transform",
      "rotate(-90 " + center.x + " " + center.y + ")"
    );
    pieChartSVG.appendChild(pathAuditReceived);

    // Create labels for auditDone and auditReceived
    const labelAuditDone = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    labelAuditDone.textContent = "Audit Done";
    labelAuditDone.setAttribute("x", center.x - 30);
    labelAuditDone.setAttribute("y", center.y - 70);
    labelAuditDone.setAttribute("fill", "white");
    pieChartSVG.appendChild(labelAuditDone);

    const labelAuditReceived = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    labelAuditReceived.textContent = "Audit Received";
    labelAuditReceived.setAttribute("x", center.x - 50);
    labelAuditReceived.setAttribute("y", center.y + 100);
    labelAuditReceived.setAttribute("fill", "white");
    pieChartSVG.appendChild(labelAuditReceived);

    document.getElementById("ratioGraph").appendChild(pieChartSVG);

    // Add event listener for the logout button
    document.getElementById("logoutButton").addEventListener("click", () => {
      localStorage.removeItem("jwt");
      window.location.href = "index.html";
    });
  } catch (error) {
    console.error("GraphQL request failed:", error.message);
  }
});
