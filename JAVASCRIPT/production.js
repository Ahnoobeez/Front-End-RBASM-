function initializeProductionPage() {
    const statusFilter = document.getElementById("productionJobOrderStatusSearch");
    const dateFilter = document.getElementById("productionJobOrderTargetDeliveryFilter");
    const tableBody = document.getElementById("productionSavedJobOrdersTableBody");

    if (!tableBody) {
        return;
    }

    const getValue = (record, ...propertyNames) => {
        for (const propertyName of propertyNames) {
            if (record && record[propertyName] !== null && record[propertyName] !== undefined && record[propertyName] !== "") {
                return record[propertyName];
            }
        }
        return "";
    };

    const normalizeDate = (value) => {
        if (!value && value !== 0) return "";
        const text = String(value).trim();
        if (!text) return "";

        const parsed = new Date(text);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().split("T")[0];
        }

        return text;
    };

    const normalizeStatus = (value) => {
        const text = String(value ?? "").trim();
        if (!text) return "";

        const lower = text.toLowerCase();
        if (lower.includes("in progress")) return "In Progress";
        if (lower === "complited" || lower === "completed") return "Completed";
        return text;
    };

    const formatBooleanChoice = (value) => {
        const text = String(value ?? "").trim().toLowerCase();
        if (text === "true" || text === "yes" || text === "with") return "Yes";
        if (text === "false" || text === "no" || text === "without") return "No";
        return "";
    };

    const renderRows = (jobOrders, clientNamesByJobOrderId) => {
        tableBody.innerHTML = "";

        if (!Array.isArray(jobOrders) || jobOrders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10">No saved Job Orders found.</td></tr>';
            return;
        }

        const rows = jobOrders.map((jobOrder) => {
            const row = document.createElement("tr");
            const status = normalizeStatus(getValue(jobOrder, "status", "Status"));
            const targetDelivery = normalizeDate(getValue(jobOrder, "target_Delivery", "Target_Delivery", "TargetDelivery"));
            const directClientName = getValue(jobOrder, "client_Name", "Client_Name", "clientName", "ClientName", "Company_Name", "company_Name");
            const jobOrderId = String(getValue(jobOrder, "jobOrder_ID", "JobOrder_ID", "JobOrderID", "jobOrderId")).trim().toLowerCase();
            const clientName = directClientName || clientNamesByJobOrderId.get(jobOrderId) || "";

            row.dataset.status = status;
            row.dataset.targetDelivery = targetDelivery;

            const values = [
                getValue(jobOrder, "jobOrder_ID", "JobOrder_ID", "JobOrderID", "jobOrderId"),
                clientName,
                getValue(jobOrder, "title", "Title"),
                normalizeDate(getValue(jobOrder, "installation_Date", "Installation_Date", "InstallationDate")),
                targetDelivery,
                normalizeDate(getValue(jobOrder, "date_Delivered", "Date_Delivered", "DateDelivered")),
                formatBooleanChoice(getValue(jobOrder, "tiling", "Tiling")),
                formatBooleanChoice(getValue(jobOrder, "eyelet", "Eyelet")),
                formatBooleanChoice(getValue(jobOrder, "bleeding", "Bleeding")),
                status
            ];

            values.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value || "--";
                row.appendChild(cell);
            });

            return row;
        });

        rows.forEach((row) => tableBody.appendChild(row));

        if (statusFilter && dateFilter) {
            const applyFilters = () => {
                const statusValue = (statusFilter.value || "").trim();
                const targetDateValue = dateFilter.value;

                rows.forEach((row) => {
                    const rowStatus = (row.dataset.status || "").trim();
                    const rowTargetDelivery = row.dataset.targetDelivery || "";
                    const matchesStatus = !statusValue || rowStatus.toLowerCase() === statusValue.toLowerCase();
                    const matchesDate = !targetDateValue || rowTargetDelivery === targetDateValue;
                    row.style.display = matchesStatus && matchesDate ? "" : "none";
                });
            };

            statusFilter.addEventListener("change", applyFilters);
            dateFilter.addEventListener("change", applyFilters);
        }
    };

    const loadSavedJobOrders = async () => {
        try {
            if (typeof getProductionJobOrders !== "function" || typeof getProductionConforme !== "function" || typeof getProductionQuotation !== "function" || typeof getProductionClientsProject !== "function" || typeof getProductionClients !== "function") {
                throw new Error("Production Job Order client lookup APIs are not available.");
            }

            const [jobOrders, conformes, quotations, projects, clients] = await Promise.all([
                getProductionJobOrders(),
                getProductionConforme(),
                getProductionQuotation(),
                getProductionClientsProject(),
                getProductionClients()
            ]);

            if (![jobOrders, conformes, quotations, projects, clients].every(Array.isArray)) {
                throw new Error("Invalid job order client lookup response from API.");
            }

            const normalizeId = (value) => String(value ?? "").trim().toLowerCase();
            const createIndex = (records, ...idProperties) => new Map(
                records
                    .map((record) => [normalizeId(getValue(record, ...idProperties)), record])
                    .filter(([id]) => id)
            );
            const conformesById = createIndex(conformes, "fileID", "FileID", "fileId", "conforme_FileID", "Conforme_FileID");
            const quotationsById = createIndex(quotations, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
            const projectsById = createIndex(projects, "project_ID", "Project_ID", "ProjectID", "projectId");
            const clientsById = createIndex(clients, "client_ID", "Client_ID", "ClientID", "clientId");
            const clientNamesByJobOrderId = new Map();

            jobOrders.forEach((jobOrder) => {
                const conforme = conformesById.get(normalizeId(getValue(jobOrder, "conforme_FileID", "Conforme_FileID", "ConformeFileID")));
                const quotation = quotationsById.get(normalizeId(getValue(conforme, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId")));
                const project = projectsById.get(normalizeId(getValue(quotation, "project_ID", "Project_ID", "ProjectID", "projectId")));
                const client = clientsById.get(normalizeId(getValue(project, "client_ID", "Client_ID", "ClientID", "clientId")));
                const jobOrderId = normalizeId(getValue(jobOrder, "jobOrder_ID", "JobOrder_ID", "JobOrderID", "jobOrderId"));
                const clientName = getValue(client, "client_Name", "Client_Name", "clientName", "ClientName", "Company_Name", "company_Name", "CompanyName");
                if (jobOrderId && clientName) {
                    clientNamesByJobOrderId.set(jobOrderId, clientName);
                }
            });

            renderRows(jobOrders, clientNamesByJobOrderId);
        } catch (error) {
            console.error("Failed to load saved Job Orders:", error);
            tableBody.innerHTML = '<tr><td colspan="10">Saved Job Orders are unavailable because the API is offline.</td></tr>';
        }
    };

    loadSavedJobOrders();
}
