// =========================
// MARKETING PAGE
// =========================

// Initialize Marketing page components
function initializeMarketingPage() {

    function clearQuotationForm() {
        [
            "projectRequestLookupInput",
            "Quotation_Title",
            "Quotation_EndDate",
            "Quotation_Branch",
            "Quotation_Requirement",
            "Quotation_Description",
            "Quotation_Width",
            "Quotation_Height",
            "Quotation_Quantity",
            "Quotation_UnitPrice",
            "Quotation_Amount",
            "Quotation_SubTotal",
            "Quotation_LessDiscount",
            "Quotation_IngressEgress",
            "Quotation_TotalAmount",
            "Quotation_TermsandConditions",
            "Quotation_ProjectOwner",
            "Quotation_ID",
            "QS_ID"
        ].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = "";
            }
        });

        const tableBody = document.getElementById("Quotation_ItemsTableBody");
        tableBody?.replaceChildren();

        const titleHeader = tableBody?.closest("table")?.querySelector("thead th:first-child");
        if (titleHeader) {
            titleHeader.textContent = "Project Title";
        }
    }

    const generateQuoteButton = document.getElementById("Quotation_GenerateButton");
    if (generateQuoteButton && !generateQuoteButton.dataset.initialized) {
        generateQuoteButton.dataset.initialized = "true";
        generateQuoteButton.addEventListener("click", function () {
            CreateQuotation();
        });
    }

    const saveItemsButton = document.getElementById("Quotation_SaveItems");
    if (saveItemsButton && !saveItemsButton.dataset.initialized) {
        saveItemsButton.dataset.initialized = "true";
        saveItemsButton.addEventListener("click", async function () {
            saveItemsButton.disabled = true;
            try {
                const quotationId = await CreateQuotation();
                const qsId = await CreateQuotationStore(quotationId);
                const savedCount = await CreateQuotationItems(qsId);
                clearQuotationForm();
                alert(`Quotation saved with ${savedCount} Project Items row(s).`);
            } catch (error) {
                console.error("Failed to save quotation:", error);
                alert(`Failed to save quotation: ${error.message}`);
            } finally {
                saveItemsButton.disabled = false;
            }
        });
    }

    const conformeSaveButton = document.getElementById("Conforme_SaveButton");
    if (conformeSaveButton && !conformeSaveButton.dataset.initialized) {
        conformeSaveButton.dataset.initialized = "true";
        conformeSaveButton.addEventListener("click", async function () {
            const fileInput = document.getElementById("Conforme_File");
            const quotationId = document.getElementById("quotationOverviewLookupInput")?.value.trim();
            const files = Array.from(fileInput?.files || []);

            if (!quotationId) {
                alert("Select a quotation overview before saving conforme files.");
                return;
            }
            if (files.length === 0) {
                alert("Select at least one PDF file before saving.");
                return;
            }

            conformeSaveButton.disabled = true;
            try {
                for (const file of files) {
                    await CreateConforme(file, quotationId);
                }
                document.getElementById("ConformeUploadForm")?.clearSelectedFiles?.();
                alert(`Saved ${files.length} conforme file(s).`);
            } catch (error) {
                console.error("Failed to save conforme files:", error);
                alert(`Failed to save conforme files: ${error.message}`);
            } finally {
                conformeSaveButton.disabled = false;
            }
        });
    }

    initializeQuotationEstimateTable();
    initializeClientLookup();
    initializeProjectRequestLookup();
    initializeQuotationOverviewLookup();
    initializePurchaseOrderConformeLookup();
    initializePurchaseOrderUpload();
    initializePurchaseOrderSave();
    initializeJobOrderConformeLookup();
    initializeJobOrderSave();
    initializeDeliveryReceiptFilePickers();
    initializeDeliveryReceiptJobOrderPicker();
    initializeDeliveryReceiptSave();
    initializeCollectionReceiptJobOrderPicker();
    initializeCollectionReceiptSave();
    initializeConformePreview();

}

function initializeQuotationEstimateTable() {

    
    
    const addButton = document.getElementById("Quotation_AddItem");
    const requirementsAddButton = document.getElementById("Quotation_AddRequirement");
    const deleteRequirementButton = document.getElementById("Quotation_DeleteRequirement");
    const tableBody = document.getElementById("Quotation_ItemsTableBody");
    const titleInput = document.getElementById("Quotation_Title");
    const titleColumnHeader = tableBody?.closest("table")?.querySelector("thead th:first-child");
    const subtotalInput = document.getElementById("Quotation_SubTotal");
    const discountInput = document.getElementById("Quotation_LessDiscount");
    const ingressEgressInput = document.getElementById("Quotation_IngressEgress");
    const totalAmountInput = document.getElementById("Quotation_TotalAmount");

    function updateQuotationSummary() {
        const subtotal = Array.from(tableBody.rows).reduce((sum, row) => {
            const record = JSON.parse(row.dataset.record || "{}");
            const amountText = record.amount || "0";
            const amount = Number.parseFloat(amountText.replace(/,/g, "")) || 0;
            return sum + amount;
        }, 0);

        if (subtotalInput) {
            subtotalInput.value = String(subtotal);
        }

        if (totalAmountInput) {
            const discount = Number.parseFloat(discountInput?.value || "0") || 0;
            const ingressEgress = Number.parseFloat(ingressEgressInput?.value || "0") || 0;
            totalAmountInput.value = String(subtotal - discount + ingressEgress);
        }
    }

    function createRowControl(label, action) {
        const iconByAction = {
            edit: "bx-edit",
            delete: "bx-trash",
            save: "bx-save",
            cancel: "bx-x"
        };
        const button = document.createElement("button");
        button.type = "button";
        button.className = "quotation-row-action";
        button.dataset.rowAction = action;
        button.setAttribute("aria-label", label);
        button.title = label;

        const icon = document.createElement("i");
        icon.className = `bx ${iconByAction[action]}`;
        icon.setAttribute("aria-hidden", "true");
        button.appendChild(icon);
        return button;
    }

    function renderQuotationRow(row, record) {
        row.replaceChildren();
        row.className = record.type === "branch" ? "quotation-branch-row" : "";
        row.dataset.record = JSON.stringify(record);

        if (record.type === "branch") {
            [record.branch, "", "", "", "", ""].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
        } else {
            const titleCell = document.createElement("td");
            const titleParts = document.createElement("div");
            titleParts.className = "quotation-title-parts";
            const requirementText = document.createElement("span");
            requirementText.textContent = record.requirement;
            const descriptionText = document.createElement("span");
            descriptionText.textContent = record.description;
            titleParts.append(requirementText, descriptionText);
            titleCell.appendChild(titleParts);
            row.appendChild(titleCell);

            [record.width, record.height, record.quantity, record.unitPrice, record.amount].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
        }

        const actionsCell = document.createElement("td");
        actionsCell.className = "quotation-row-actions";
        actionsCell.append(createRowControl("Edit", "edit"), createRowControl("Delete", "delete"));
        row.appendChild(actionsCell);
    }

    function createEditInput(field, value) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "quotation-row-edit-input";
        input.dataset.editField = field;
        input.value = value || "";
        return input;
    }

    function renderEditableRow(row, record) {
        row.replaceChildren();

        if (record.type === "branch") {
            const branchCell = document.createElement("td");
            branchCell.appendChild(createEditInput("branch", record.branch));
            row.appendChild(branchCell);
            for (let index = 0; index < 5; index += 1) {
                row.appendChild(document.createElement("td"));
            }
        } else {
            const titleCell = document.createElement("td");
            const titleInputs = document.createElement("div");
            titleInputs.className = "quotation-title-parts";
            titleInputs.append(
                createEditInput("requirement", record.requirement),
                createEditInput("description", record.description)
            );
            titleCell.appendChild(titleInputs);
            row.appendChild(titleCell);

            ["width", "height", "quantity", "unitPrice", "amount"].forEach(field => {
                const cell = document.createElement("td");
                cell.appendChild(createEditInput(field, record[field]));
                row.appendChild(cell);
            });
        }

        const actionsCell = document.createElement("td");
        actionsCell.className = "quotation-row-actions";
        actionsCell.append(createRowControl("Save", "save"), createRowControl("Cancel", "cancel"));
        row.appendChild(actionsCell);
    }

    if (!addButton || !tableBody || addButton.dataset.initialized) {
        return;
    }

    addButton.dataset.initialized = "true";
    addButton.addEventListener("click", function () {
        if (titleInput && titleColumnHeader) {
            titleColumnHeader.textContent = titleInput.value;
        }
    });

    [discountInput, ingressEgressInput].forEach(summaryInput => {
        summaryInput?.addEventListener("input", updateQuotationSummary);
    });

    tableBody.addEventListener("click", function (event) {
        const button = event.target.closest("[data-row-action]");
        if (!button) {
            return;
        }

        const row = button.closest("tr");
        const record = JSON.parse(row.dataset.record || "{}");

        if (button.dataset.rowAction === "delete") {
            row.remove();
            updateQuotationSummary();
        } else if (button.dataset.rowAction === "edit") {
            renderEditableRow(row, record);
        } else if (button.dataset.rowAction === "cancel") {
            renderQuotationRow(row, record);
        } else if (button.dataset.rowAction === "save") {
            row.querySelectorAll("[data-edit-field]").forEach(input => {
                record[input.dataset.editField] = input.value.trim();
            });
            renderQuotationRow(row, record);
            updateQuotationSummary();
        }
    });

    if (requirementsAddButton && !requirementsAddButton.dataset.initialized) {
        requirementsAddButton.dataset.initialized = "true";
        requirementsAddButton.addEventListener("click", function () {
            const branch = document.getElementById("Quotation_Branch")?.value.trim() || "";
            const requirement = document.getElementById("Quotation_Requirement")?.value.trim() || "";
            const description = document.getElementById("Quotation_Description")?.value.trim() || "";
            const width = document.getElementById("Quotation_Width")?.value.trim() || "";
            const height = document.getElementById("Quotation_Height")?.value.trim() || "";
            const quantity = document.getElementById("Quotation_Quantity")?.value.trim() || "";
            const unitPrice = document.getElementById("Quotation_UnitPrice")?.value.trim() || "";
            const amount = document.getElementById("Quotation_Amount")?.value.trim() || "";

            function appendRow(record) {
                const row = document.createElement("tr");
                renderQuotationRow(row, record);
                tableBody.appendChild(row);
            }

            const branchAlreadyAdded = Array.from(
                tableBody.querySelectorAll(".quotation-branch-row")
            ).some(row => row.cells[0]?.textContent.trim() === branch);

            if (branch && !branchAlreadyAdded) {
                appendRow({ type: "branch", branch });
            }

            if ([requirement, description, width, height, quantity, unitPrice, amount].some(Boolean)) {
                appendRow({
                    type: "detail",
                    branch,
                    requirement,
                    description,
                    width,
                    height,
                    quantity,
                    unitPrice,
                    amount
                });
            }

            updateQuotationSummary();

            [
                "Quotation_Requirement",
                "Quotation_Description",
                "Quotation_Width",
                "Quotation_Height",
                "Quotation_Quantity",
                "Quotation_UnitPrice",
                "Quotation_Amount"
            ].forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = "";
                }
            });
        });
    }

    if (deleteRequirementButton && !deleteRequirementButton.dataset.initialized) {
        deleteRequirementButton.dataset.initialized = "true";
        deleteRequirementButton.addEventListener("click", function () {
            const detailRows = Array.from(tableBody.rows).filter(
                row => !row.classList.contains("quotation-branch-row")
            );
            const lastDetailRow = detailRows[detailRows.length - 1];
            if (!lastDetailRow) {
                return;
            }

            const record = JSON.parse(lastDetailRow.dataset.record || "{}");
            lastDetailRow.remove();

            if (record.branch) {
                const hasRemainingBranchItems = Array.from(tableBody.rows).some(row => {
                    if (row.classList.contains("quotation-branch-row")) {
                        return false;
                    }
                    return JSON.parse(row.dataset.record || "{}").branch === record.branch;
                });
                if (!hasRemainingBranchItems) {
                    Array.from(tableBody.querySelectorAll(".quotation-branch-row"))
                        .find(row => row.cells[0]?.textContent.trim() === record.branch)
                        ?.remove();
                }
            }

            updateQuotationSummary();
        });
    }
}

function initializePurchaseOrderUpload() {
    const uploaders = [
        {
            formId: "PurchaseOrderForm",
            inputId: "PurchaseOrder_File",
            dropzoneId: "PurchaseOrder_Dropzone",
            fileListId: "PurchaseOrder_FileList",
            pdfOnly: true,
            maxFileSize: 2 * 1000 * 1000
        },
        {
            formId: "ConformeUploadForm",
            inputId: "Conforme_File",
            dropzoneId: "Conforme_Dropzone",
            fileListId: "Conforme_FileList",
            pdfOnly: true,
            maxFileSize: 2 * 1000 * 1000
        },
        {
            formId: "CollectionReceiptUploadForm",
            inputId: "CollectionReceipt_File",
            dropzoneId: "CollectionReceipt_Dropzone",
            fileListId: "CollectionReceipt_FileList",
            imageOnly: true,
            maxFileSize: 2 * 1024 * 1024
        }
    ];

    uploaders.forEach(uploader => {
        const form = document.getElementById(uploader.formId);
        const fileInput = document.getElementById(uploader.inputId);
        const dropzone = document.getElementById(uploader.dropzoneId);
        const fileList = document.getElementById(uploader.fileListId);

        if (!form || !fileInput || !dropzone || !fileList || form.dataset.initialized) {
            return;
        }

        form.dataset.initialized = "true";
        let selectedFiles = [];

        function syncFileInput() {
            const dataTransfer = new DataTransfer();
            selectedFiles.forEach(file => dataTransfer.items.add(file));
            fileInput.files = dataTransfer.files;
        }

        function showSelectedFiles() {
            fileList.replaceChildren();
            selectedFiles.forEach((file, index) => {
                const item = document.createElement("li");
                const fileName = document.createElement("span");
                const deleteButton = document.createElement("button");
                const fileSize = file.size >= 1024 ** 3
                    ? `${(file.size / 1024 ** 3).toFixed(2)} GB`
                    : file.size >= 1024 ** 2
                        ? `${(file.size / 1024 ** 2).toFixed(2)} MB`
                        : `${Math.ceil(file.size / 1024)} KB`;

                fileName.textContent = `${file.name} (${fileSize})`;
                deleteButton.type = "button";
                deleteButton.className = "purchase-order-remove-file";
                deleteButton.textContent = "Delete";
                deleteButton.setAttribute("aria-label", `Delete ${file.name}`);
                deleteButton.addEventListener("click", () => {
                    selectedFiles.splice(index, 1);
                    showSelectedFiles();
                });

                item.append(fileName, deleteButton);
                fileList.appendChild(item);
            });
            syncFileInput();
        }

        form.clearSelectedFiles = function () {
            selectedFiles = [];
            fileInput.value = "";
            showSelectedFiles();
        };

        function addFiles(files) {
            const rejectedFiles = [];
            Array.from(files).forEach(file => {
                const isPdf = /\.pdf$/i.test(file.name)
                    && (!file.type || file.type.toLowerCase() === "application/pdf");
                const isImage = file.type.toLowerCase().startsWith("image/");
                if (uploader.imageOnly && !isImage) {
                    rejectedFiles.push(`${file.name} (photo/image files only)`);
                } else if (uploader.pdfOnly && !isPdf) {
                    rejectedFiles.push(`${file.name} (PDF files only)`);
                } else if (uploader.maxFileSize && file.size > uploader.maxFileSize) {
                    rejectedFiles.push(`${file.name} (over 2 MB)`);
                } else {
                    selectedFiles.push(file);
                }
            });

            if (rejectedFiles.length) {
                const allowedType = uploader.imageOnly ? "photo/image files" : "PDF files";
                window.alert(
                    `Upload error: ${rejectedFiles.join(", ")}. Only ${allowedType} up to 2 MB each are allowed.`
                );
            }
            showSelectedFiles();
        }

        fileInput.addEventListener("change", () => {
            const files = Array.from(fileInput.files);
            fileInput.value = "";
            addFiles(files);
        });

        ["dragenter", "dragover"].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                dropzone.classList.add("is-dragging");
            });
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                dropzone.classList.remove("is-dragging");
            });
        });

        dropzone.addEventListener("drop", event => {
            addFiles(event.dataTransfer.files);
        });
    });
}

function initializePurchaseOrderSave() {
    const saveButton = document.getElementById("PurchaseOrder_Save");
    const fileInput = document.getElementById("PurchaseOrder_File");
    const conformeIdInput = document.getElementById("PurchaseOrder_ConformeID");
    const form = document.getElementById("PurchaseOrderForm");

    if (!saveButton || !fileInput || !conformeIdInput || saveButton.dataset.initialized) {
        return;
    }

    saveButton.dataset.initialized = "true";
    saveButton.addEventListener("click", async function () {
        const files = Array.from(fileInput.files || []);
        const conformeId = conformeIdInput.value.trim();

        if (!conformeId) {
            alert("Select a saved Conforme before saving purchase orders.");
            return;
        }
        if (files.length === 0) {
            alert("Select at least one purchase order PDF before saving.");
            return;
        }

        saveButton.disabled = true;
        try {
            for (const file of files) {
                await CreatePurchaseOrder(file, conformeId);
            }
            form?.clearSelectedFiles?.();
            alert(`Saved ${files.length} purchase order PDF file(s).`);
        } catch (error) {
            console.error("Failed to save purchase order files:", error);
            alert(`Failed to save purchase order files: ${error.message}`);
        } finally {
            saveButton.disabled = false;
        }
    });
}

function initializeClientLookup() {

    const openButton = document.getElementById("openClientPicker");
    const closeButton = document.getElementById("closeClientPicker");
    const modal = document.getElementById("clientPickerModal");
    const tableBody = document.getElementById("clientPickerTableBody");
    const searchInput = document.getElementById("clientPickerSearch");

    if (!openButton || !closeButton || !modal || !tableBody) {
        return;
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterTableRows(tableBody, searchInput.value);
        });
    }

    setClientDependentFieldsEnabled(false);
    setConformeFieldsEnabled(false);

    openButton.addEventListener("click", async function () {
        modal.hidden = false;
        if (searchInput) {
            searchInput.value = "";
        }
        tableBody.innerHTML = `<tr><td colspan="6">Loading clients...</td></tr>`;

        try {
            const clients = await getClients();

            if (!Array.isArray(clients) || clients.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6">No saved client records found.</td></tr>`;
                return;
            }

            tableBody.innerHTML = "";

            clients.forEach(client => {
                const row = document.createElement("tr");
                const values = [
                    getClientValue(client, "client_ID", "Client_ID"),
                    getClientValue(client, "client_Name", "Client_Name"),
                    getClientValue(client, "client_Telephone", "Client_Telephone"),
                    getClientValue(client, "client_Address", "Client_Address"),
                    getClientValue(client, "tin", "client_TinNumber", "TIN", "Tin"),
                    getClientValue(client, "payment_Terms", "client_PaymentTerms", "Payment_Terms")
                ];

                values.forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                row.addEventListener("click", function () {
                    selectClient(client);
                    modal.hidden = true;
                });

                tableBody.appendChild(row);
            });

            if (searchInput) {
                filterTableRows(tableBody, searchInput.value);
            }
        } catch (error) {
            console.error("Failed to load clients:", error);
            tableBody.innerHTML = `<tr><td colspan="6">Failed to load client records.</td></tr>`;
        }
    });

    closeButton.addEventListener("click", function () {
        modal.hidden = true;
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.hidden = true;
        }
    });
}

function initializeProjectRequestLookup() {
    const openButton = document.getElementById("openProjectRequestPicker");
    const closeButton = document.getElementById("closeProjectRequestPicker");
    const modal = document.getElementById("projectRequestPickerModal");
    const tableBody = document.getElementById("projectRequestPickerTableBody");
    const searchInput = document.getElementById("projectRequestPickerSearch");

    if (!openButton || !closeButton || !modal || !tableBody) {
        return;
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterTableRows(tableBody, searchInput.value);
        });
    }

    openButton.addEventListener("click", async function () {
        modal.hidden = false;
        if (searchInput) {
            searchInput.value = "";
        }

        tableBody.innerHTML = `<tr><td colspan="10">Loading saved client projects...</td></tr>`;

        try {
            const projects = await getClientsProject();

            if (!Array.isArray(projects) || projects.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="10">No saved client projects found.</td></tr>`;
                return;
            }

            tableBody.innerHTML = "";
            projects.forEach(project => {
                const row = document.createElement("tr");
                const values = [
                    getClientValue(project, "project_ID", "Project_ID"),
                    getClientValue(project, "client_ID", "Client_ID"),
                    getClientValue(project, "attention", "Attention"),
                    getClientValue(project, "business_Style", "Business_Style"),
                    getClientValue(project, "client_Subject", "Client_Subject"),
                    getClientValue(project, "representative", "Representative"),
                    getClientValue(project, "contact_Person", "Contact_Person"),
                    getClientValue(project, "account_Executive", "Account_Executive"),
                    getClientValue(project, "date", "Date"),
                    getClientValue(project, "time", "Time")
                ];

                values.forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                row.addEventListener("click", function () {
                    const lookupInput = document.getElementById("projectRequestLookupInput");
                    if (lookupInput) {
                        lookupInput.value = getClientValue(project, "project_ID", "Project_ID");
                    }
                    modal.hidden = true;
                });

                tableBody.appendChild(row);
            });

            filterTableRows(tableBody, searchInput ? searchInput.value : "");
        } catch (error) {
            console.error("Failed to load client projects:", error);
            tableBody.innerHTML = `<tr><td colspan="10">Saved client projects are unavailable because the API is offline.</td></tr>`;
        }
    });

    closeButton.addEventListener("click", function () {
        modal.hidden = true;
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.hidden = true;
        }
    });
}

function initializeQuotationOverviewLookup() {
    const openButton = document.getElementById("openQuotationOverviewPicker");
    const closeButton = document.getElementById("closeQuotationOverviewPicker");
    const modal = document.getElementById("quotationOverviewPickerModal");
    const tableBody = document.getElementById("quotationOverviewPickerTableBody");
    const searchInput = document.getElementById("quotationOverviewPickerSearch");

    if (!openButton || !closeButton || !modal || !tableBody) {
        return;
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterTableRows(tableBody, searchInput.value);
        });
    }

    openButton.addEventListener("click", async function () {
        modal.hidden = false;
        if (searchInput) {
            searchInput.value = "";
        }
        await loadQuotationsIntoTable(tableBody, function (quotationId) {
            const lookupInput = document.getElementById("quotationOverviewLookupInput");
            if (lookupInput) {
                lookupInput.value = quotationId;
            }
            modal.hidden = true;
        });

        if (searchInput) {
            filterTableRows(tableBody, searchInput.value);
        }
    });

    closeButton.addEventListener("click", function () {
        modal.hidden = true;
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.hidden = true;
        }
    });
}

function initializePurchaseOrderConformeLookup() {
    const openButton = document.getElementById("openPurchaseOrderConformePicker");
    const closeButton = document.getElementById("closePurchaseOrderConformePicker");
    const modal = document.getElementById("purchaseOrderConformePickerModal");
    const tableBody = document.getElementById("purchaseOrderConformePickerTableBody");
    const searchInput = document.getElementById("purchaseOrderConformePickerSearch");

    if (!openButton || !closeButton || !modal || !tableBody || openButton.dataset.initialized) {
        return;
    }

    openButton.dataset.initialized = "true";
    searchInput?.addEventListener("input", () => filterTableRows(tableBody, searchInput.value));

    openButton.addEventListener("click", async function () {
        modal.hidden = false;
        tableBody.innerHTML = `<tr><td colspan="3">Loading saved Conforme files...</td></tr>`;
        if (searchInput) {
            searchInput.value = "";
        }

        try {
            const [conformeRecords, quotations, projects, clients] = await Promise.all([
                getConforme(),
                getQuotation(),
                getClientsProject(),
                getClients()
            ]);
            const normalizeId = value => String(value ?? "").trim().toLowerCase();
            const quotationsById = new Map(quotations.map(quotation => [
                normalizeId(getClientValue(quotation, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId")),
                quotation
            ]).filter(([quotationId]) => quotationId));
            const projectsById = new Map(projects.map(project => [
                normalizeId(getClientValue(project, "project_ID", "Project_ID", "ProjectID", "projectId")),
                project
            ]).filter(([projectId]) => projectId));
            const clientsById = new Map(clients.map(client => [
                normalizeId(getClientValue(client, "client_ID", "Client_ID", "ClientID", "clientId")),
                client
            ]).filter(([clientId]) => clientId));

            tableBody.replaceChildren();
            if (!Array.isArray(conformeRecords) || conformeRecords.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3">No saved Conforme files found.</td></tr>`;
                return;
            }

            conformeRecords.forEach(record => {
                const conformeId = getClientValue(record, "fileID", "FileID", "fileId", "FileId");
                const quotationId = getClientValue(record, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
                const quotation = quotationsById.get(normalizeId(quotationId));
                const projectId = getClientValue(quotation || {}, "project_ID", "Project_ID", "ProjectID", "projectId");
                const project = projectsById.get(normalizeId(projectId));
                const clientId = getClientValue(project || {}, "client_ID", "Client_ID", "ClientID", "clientId");
                const client = clientsById.get(normalizeId(clientId));
                const storedFileName = String(getClientValue(record, "fileName", "FileName", "filename"));
                const extension = String(getClientValue(record, "fileExtension", "FileExtension", "extension"));
                const fileName = extension && !storedFileName.toLowerCase().endsWith(extension.toLowerCase())
                    ? `${storedFileName}${extension}`
                    : storedFileName;
                const clientName = getClientValue(client || {}, "client_Name", "Client_Name", "Company_Name", "company_Name", "CompanyName");
                const row = document.createElement("tr");

                [conformeId, clientName, fileName].forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });
                row.tabIndex = 0;
                row.setAttribute("role", "button");

                const selectConforme = () => {
                    document.getElementById("PurchaseOrder_ConformeID").value = conformeId;
                    document.getElementById("purchaseOrderConformeLookupInput").value = `${conformeId} - ${fileName}`;
                    modal.hidden = true;
                };
                row.addEventListener("click", selectConforme);
                row.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectConforme();
                    }
                });
                tableBody.appendChild(row);
            });

            filterTableRows(tableBody, searchInput?.value || "");
        } catch (error) {
            console.error("Failed to load saved Conforme files:", error);
            tableBody.innerHTML = `<tr><td colspan="3">Saved Conforme files are unavailable.</td></tr>`;
        }
    });

    closeButton.addEventListener("click", () => {
        modal.hidden = true;
    });
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.hidden = true;
        }
    });
}

function initializeJobOrderConformeLookup() {
    const openButton = document.getElementById("openJobOrderConformePicker");
    const closeButton = document.getElementById("closeJobOrderConformePicker");
    const modal = document.getElementById("jobOrderConformePickerModal");
    const tableBody = document.getElementById("jobOrderConformePickerTableBody");
    const searchInput = document.getElementById("jobOrderConformePickerSearch");

    if (!openButton || !closeButton || !modal || !tableBody || openButton.dataset.initialized) {
        return;
    }

    openButton.dataset.initialized = "true";
    searchInput?.addEventListener("input", () => filterTableRows(tableBody, searchInput.value));

    openButton.addEventListener("click", async function () {
        modal.hidden = false;
        tableBody.innerHTML = `<tr><td colspan="3">Loading saved Conforme files...</td></tr>`;
        if (searchInput) {
            searchInput.value = "";
        }

        try {
            const [conformeRecords, quotations, quotationStores, quotationItems, projects, clients] = await Promise.all([
                getConforme(),
                getQuotation(),
                getQuotationStore(),
                getQuotationItems(),
                getClientsProject(),
                getClients()
            ]);
            if (![conformeRecords, quotations, quotationStores, quotationItems, projects, clients].every(Array.isArray)) {
                throw new Error("Saved Conforme details are unavailable.");
            }

            tableBody.replaceChildren();
            if (conformeRecords.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3">No saved Conforme files found.</td></tr>`;
                return;
            }

            const normalizeId = value => String(value ?? "").trim().toLowerCase();
            const createIndex = (records, ...idProperties) => new Map(records.map(record => [
                normalizeId(getClientValue(record, ...idProperties)),
                record
            ]).filter(([id]) => id));
            const quotationsById = createIndex(quotations, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
            const projectsById = createIndex(projects, "project_ID", "Project_ID", "ProjectID", "projectId");
            const clientsById = createIndex(clients, "client_ID", "Client_ID", "ClientID", "clientId");
            const storesByQuotationId = new Map();
            quotationStores.forEach(store => {
                const quotationId = normalizeId(getClientValue(store, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId"));
                if (!quotationId) {
                    return;
                }
                const stores = storesByQuotationId.get(quotationId) || [];
                stores.push(store);
                storesByQuotationId.set(quotationId, stores);
            });

            conformeRecords.forEach(record => {
                const conformeId = getClientValue(record, "fileID", "FileID", "fileId", "FileId");
                const quotationId = getClientValue(record, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
                const quotation = quotationsById.get(normalizeId(quotationId));
                const projectId = getClientValue(quotation || {}, "project_ID", "Project_ID", "ProjectID", "projectId");
                const project = projectsById.get(normalizeId(projectId));
                const clientId = getClientValue(project || {}, "client_ID", "Client_ID", "ClientID", "clientId");
                const client = clientsById.get(normalizeId(clientId));
                const clientName = getClientValue(client || {}, "client_Name", "Client_Name", "Company_Name", "company_Name", "CompanyName");
                const storedFileName = String(getClientValue(record, "fileName", "FileName", "filename"));
                const fileExtension = String(getClientValue(record, "fileExtension", "FileExtension", "extension"));
                const fileName = fileExtension && !storedFileName.toLowerCase().endsWith(fileExtension.toLowerCase())
                    ? `${storedFileName}${fileExtension}`
                    : storedFileName;
                const row = document.createElement("tr");

                [conformeId, clientName, fileName].forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });
                row.tabIndex = 0;
                row.setAttribute("role", "button");

                const selectConforme = () => {
                    document.getElementById("JobOrder_ConformeID").value = conformeId;
                    document.getElementById("jobOrderConformeLookupInput").value = `${conformeId} - ${fileName}`;

                    const itemsTable = document.getElementById("JobOrder_ItemsTableBody")?.closest("table");
                    const projectTitleHeader = itemsTable?.querySelector("thead th:first-child");
                    if (projectTitleHeader) {
                        projectTitleHeader.textContent = getClientValue(quotation || {}, "title", "Title") || "Project Title";
                    }

                    const jobOrderValues = {
                        JobOrder_Client: getClientValue(client || {}, "client_Name", "Client_Name", "Company_Name", "company_Name", "CompanyName"),
                        JobOrder_Address: getClientValue(client || {}, "client_Address", "Client_Address", "Company_Address", "CompanyAddress"),
                        JobOrder_Telephone: getClientValue(client || {}, "client_Telephone", "Client_Telephone", "Telephone", "telephone"),
                        JobOrder_ContactPerson: getClientValue(project || {}, "contact_Person", "Contact_Person", "ContactPerson"),
                        JobOrder_AccountExecutive: getClientValue(project || {}, "account_Executive", "Account_Executive", "AccountExecutive")
                    };
                    Object.entries(jobOrderValues).forEach(([fieldId, value]) => {
                        const field = document.getElementById(fieldId);
                        if (field) {
                            field.value = value;
                        }
                    });

                    const itemsTableBody = document.getElementById("JobOrder_ItemsTableBody");
                    itemsTableBody?.replaceChildren();
                    const stores = storesByQuotationId.get(normalizeId(quotationId)) || [];
                    stores.forEach(store => {
                        const storeId = normalizeId(getClientValue(store, "qS_ID", "QS_ID", "qsId", "QsId"));
                        const branchRow = document.createElement("tr");
                        branchRow.className = "quotation-branch-row";
                        const branchCell = document.createElement("td");
                        branchCell.textContent = getClientValue(store, "store", "Store");
                        branchRow.appendChild(branchCell);
                        for (let index = 0; index < 6; index += 1) {
                            branchRow.appendChild(document.createElement("td"));
                        }
                        itemsTableBody?.appendChild(branchRow);

                        quotationItems.filter(item => storeId && normalizeId(
                            getClientValue(item, "qS_ID", "QS_ID", "qsId", "QsId")
                        ) === storeId).forEach(item => {
                            const row = document.createElement("tr");
                            const titleCell = document.createElement("td");
                            const titleParts = document.createElement("div");
                            titleParts.className = "quotation-title-parts";
                            const itemRecord = {
                                requirements: getClientValue(item, "requirements", "Requirements"),
                                description: getClientValue(item, "description", "Description"),
                                width: getClientValue(item, "width", "Width"),
                                length: getClientValue(item, "height", "Height", "length", "Length"),
                                quantity: getClientValue(item, "quantity", "Quantity")
                            };
                            row.dataset.jobOrderItem = JSON.stringify(itemRecord);
                            const itemTitle = [itemRecord.requirements, itemRecord.description].filter(Boolean);
                            itemTitle.forEach(value => {
                                const part = document.createElement("span");
                                part.textContent = value;
                                titleParts.appendChild(part);
                            });
                            titleCell.appendChild(titleParts);
                            row.appendChild(titleCell);

                            [
                                getClientValue(item, "width", "Width"),
                                getClientValue(item, "height", "Height"),
                                getClientValue(item, "quantity", "Quantity")
                            ].forEach(value => {
                                const cell = document.createElement("td");
                                cell.textContent = value;
                                row.appendChild(cell);
                            });

                            ["Artist Initial", "Prod'n Initial", "Remarks"].forEach(label => {
                                const cell = document.createElement("td");
                                const input = document.createElement("input");
                                input.type = "text";
                                input.className = "job-order-item-input";
                                input.setAttribute("aria-label", `${label} for ${itemTitle.join(" ") || "production item"}`);
                                cell.appendChild(input);
                                row.appendChild(cell);
                            });
                            itemsTableBody?.appendChild(row);
                        });
                    });

                    modal.hidden = true;
                };
                row.addEventListener("click", selectConforme);
                row.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectConforme();
                    }
                });
                tableBody.appendChild(row);
            });

            filterTableRows(tableBody, searchInput?.value || "");
        } catch (error) {
            console.error("Failed to load saved Conforme files:", error);
            tableBody.innerHTML = `<tr><td colspan="3">Saved Conforme files are unavailable.</td></tr>`;
        }
    });

    closeButton.addEventListener("click", () => {
        modal.hidden = true;
    });
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.hidden = true;
        }
    });
}

function createDeliveryReceiptItemRow(values = {}) {
    const row = document.createElement("tr");
    row.dataset.unit = values.unit ?? "";
    [values.quantity, values.requirement, values.description].forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value ?? "";
        row.appendChild(cell);
    });
    return row;
}

function createDeliveryReceiptBranchRow(branch) {
    const row = document.createElement("tr");
    row.className = "delivery-receipt-branch-row";

    const emptyCell = document.createElement("td");
    const branchCell = document.createElement("td");
    branchCell.colSpan = 2;
    branchCell.className = "delivery-receipt-branch-cell";
    branchCell.textContent = branch;
    row.append(emptyCell, branchCell);
    return row;
}

function clearDeliveryReceiptForm() {
    [
        "DeliveryReceipt_JobOrderID",
        "deliveryReceiptJobOrderLookupInput",
        "DeliveryReceipt_Client",
        "DeliveryReceipt_Address",
        "DeliveryReceipt_Terms"
    ].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = "";
        }
    });

    const projectTitle = document.getElementById("DeliveryReceipt_ProjectTitle");
    if (projectTitle) {
        projectTitle.textContent = "Project Title";
    }
    document.getElementById("DeliveryReceipt_ItemsTableBody")?.replaceChildren();

    [
        ["DeliveryReceipt_PreparedBy", "DeliveryReceipt_PreparedByName"],
        ["DeliveryReceipt_ApprovedBy", "DeliveryReceipt_ApprovedByName"],
        ["DeliveryReceipt_ReceivedBy", "DeliveryReceipt_ReceivedByName"]
    ].forEach(([inputId, fileNameId]) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = "";
        }
        const fileName = document.getElementById(fileNameId);
        if (fileName) {
            fileName.textContent = "No file selected";
        }
    });
}

function initializeDeliveryReceiptSave() {
    const saveButton = document.getElementById("DeliveryReceipt_Save");
    if (!saveButton || saveButton.dataset.initialized) {
        return;
    }

    saveButton.dataset.initialized = "true";
    saveButton.addEventListener("click", async () => {
        const jobOrderId = Number(document.getElementById("DeliveryReceipt_JobOrderID")?.value);
        const itemsTableBody = document.getElementById("DeliveryReceipt_ItemsTableBody");
        const itemRow = Array.from(itemsTableBody?.rows || []).find(
            row => !row.classList.contains("delivery-receipt-branch-row")
        );
        const quantity = Number(itemRow?.cells[0]?.textContent.trim());

        if (!Number.isInteger(jobOrderId) || jobOrderId <= 0) {
            alert("Select a saved Job Order before saving the Delivery Receipt.");
            return;
        }
        if (!itemRow || !Number.isInteger(quantity)) {
            alert("The selected Job Order does not have a valid item to save.");
            return;
        }

        const currentDate = new Date();
        const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
        const time = `${String(currentDate.getHours()).padStart(2, "0")}:${String(currentDate.getMinutes()).padStart(2, "0")}:${String(currentDate.getSeconds()).padStart(2, "0")}`;
        const deliveryReceipt = {
            JobOrderID: jobOrderId,
            Title: document.getElementById("DeliveryReceipt_ProjectTitle")?.textContent.trim() || "",
            Requirement: itemRow.cells[1]?.textContent.trim() || "",
            ClientName: document.getElementById("DeliveryReceipt_Client")?.value || "",
            Address: document.getElementById("DeliveryReceipt_Address")?.value || "",
            Terms: document.getElementById("DeliveryReceipt_Terms")?.value || "",
            Quantity: quantity,
            Unit: itemRow.dataset.unit,
            Description: itemRow.cells[2]?.textContent.trim() || "",
            date,
            time,
            Status: "Pending"
        };
        const deliveryFiles = [
            ["DeliveryReceipt_PreparedBy", "PreparedBy"],
            ["DeliveryReceipt_ApprovedBy", "ApprovedBy"],
            ["DeliveryReceipt_ReceivedBy", "ReceivedBy"]
        ].map(([inputId, role]) => [document.getElementById(inputId)?.files?.[0], role])
            .filter(([file]) => file);

        saveButton.disabled = true;
        let deliveryId;
        try {
            deliveryId = await CreateDeliveryReceipt(deliveryReceipt);
            for (const [file, role] of deliveryFiles) {
                await CreateDeliveryFile(file, deliveryId, role);
            }
            clearDeliveryReceiptForm();
            alert("Delivery Receipt saved successfully.");
        } catch (error) {
            console.error("Failed to save Delivery Receipt:", error);
            const savedReceiptNote = deliveryId ? ` Receipt ${deliveryId} was saved, but one or more files may not have been saved.` : "";
            alert(`Failed to save Delivery Receipt.${savedReceiptNote} ${error.message}`);
        } finally {
            saveButton.disabled = false;
        }
    });
}

function initializeDeliveryReceiptFilePickers() {
    document.querySelectorAll("[data-file-upload]").forEach(upload => {
        const input = upload.querySelector("input[type='file']");
        const fileName = upload.querySelector(".delivery-receipt-file-name");
        if (!input || !fileName || upload.dataset.initialized) {
            return;
        }

        upload.dataset.initialized = "true";
        const showFileName = file => {
            fileName.textContent = file?.name || "No file selected";
        };
        const acceptFile = file => {
            if (!file) {
                showFileName(null);
                return;
            }
            if (!file.type.startsWith("image/")) {
                input.value = "";
                showFileName(null);
                alert("Please select a photo or image file.");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                input.value = "";
                showFileName(null);
                alert("The image file must not exceed 2 MB.");
                return;
            }
            showFileName(file);
        };
        input.addEventListener("change", () => acceptFile(input.files?.[0]));
        upload.addEventListener("dragover", event => {
            event.preventDefault();
            upload.classList.add("is-dragging");
        });
        ["dragleave", "drop"].forEach(eventName => {
            upload.addEventListener(eventName, event => {
                event.preventDefault();
                upload.classList.remove("is-dragging");
            });
        });
        upload.addEventListener("drop", event => {
            const file = event.dataTransfer?.files?.[0];
            if (!file) {
                return;
            }
            if (!file.type.startsWith("image/")) {
                input.value = "";
                showFileName(null);
                alert("Please select a photo or image file.");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                input.value = "";
                showFileName(null);
                alert("The image file must not exceed 2 MB.");
                return;
            }
            const transfer = new DataTransfer();
            transfer.items.add(file);
            input.files = transfer.files;
            showFileName(file);
        });
    });
}

function initializeDeliveryReceiptJobOrderPicker() {
    const openButton = document.getElementById("openDeliveryReceiptJobOrderPicker");
    const closeButton = document.getElementById("closeDeliveryReceiptJobOrderPicker");
    const modal = document.getElementById("deliveryReceiptJobOrderPickerModal");
    const tableBody = document.getElementById("deliveryReceiptJobOrderPickerTableBody");
    const searchInput = document.getElementById("deliveryReceiptJobOrderPickerSearch");

    if (!openButton || !closeButton || !modal || !tableBody || openButton.dataset.initialized) {
        return;
    }

    openButton.dataset.initialized = "true";
    searchInput?.addEventListener("input", () => filterTableRows(tableBody, searchInput.value));

    openButton.addEventListener("click", async function () {
        modal.hidden = false;
        tableBody.innerHTML = `<tr><td colspan="4">Loading saved Job Orders...</td></tr>`;
        if (searchInput) {
            searchInput.value = "";
        }

        try {
            const [jobOrders, conformeRecords, quotations, projects, clients] = await Promise.all([
                getMarketingJobOrders(),
                getConforme(),
                getQuotation(),
                getClientsProject(),
                getClients()
            ]);
            if (![jobOrders, conformeRecords, quotations, projects, clients].every(Array.isArray)) {
                throw new Error("Saved Job Order details are unavailable.");
            }
            if (jobOrders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4">No saved Job Orders found.</td></tr>`;
                return;
            }

            const normalizeId = value => String(value ?? "").trim().toLowerCase();
            const createIndex = (records, ...idProperties) => new Map(records.map(record => [
                normalizeId(getClientValue(record, ...idProperties)),
                record
            ]).filter(([id]) => id));
            const conformesById = createIndex(conformeRecords, "fileID", "FileID", "fileId", "FileId");
            const quotationsById = createIndex(quotations, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
            const projectsById = createIndex(projects, "project_ID", "Project_ID", "ProjectID", "projectId");
            const clientsById = createIndex(clients, "client_ID", "Client_ID", "ClientID", "clientId");

            tableBody.replaceChildren();
            jobOrders.forEach(jobOrder => {
                const conformeId = getClientValue(jobOrder, "conforme_FileID", "Conforme_FileID", "ConformeFileID");
                const conforme = conformesById.get(normalizeId(conformeId));
                const quotationId = getClientValue(conforme || {}, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
                const quotation = quotationsById.get(normalizeId(quotationId));
                const projectId = getClientValue(quotation || {}, "project_ID", "Project_ID", "ProjectID", "projectId");
                const project = projectsById.get(normalizeId(projectId));
                const clientId = getClientValue(project || {}, "client_ID", "Client_ID", "ClientID", "clientId");
                const client = clientsById.get(normalizeId(clientId));
                const jobOrderId = getClientValue(jobOrder, "jobOrder_ID", "JobOrder_ID", "JobOrderID");
                const clientName = getClientValue(client || {}, "client_Name", "Client_Name", "Company_Name", "company_Name", "CompanyName");
                const title = getClientValue(jobOrder, "title", "Title");
                const row = document.createElement("tr");

                [
                    jobOrderId,
                    clientName,
                    title,
                    getClientValue(jobOrder, "date_Delivered", "Date_Delivered", "DateDelivered")
                ].forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value ?? "";
                    row.appendChild(cell);
                });
                row.tabIndex = 0;
                row.setAttribute("role", "button");

                const selectJobOrder = () => {
                    document.getElementById("DeliveryReceipt_JobOrderID").value = jobOrderId;
                    document.getElementById("deliveryReceiptJobOrderLookupInput").value = `${jobOrderId} - ${clientName || title}`;
                    document.getElementById("DeliveryReceipt_Client").value = clientName || "";
                    document.getElementById("DeliveryReceipt_Address").value = getClientValue(client || {}, "client_Address", "Client_Address", "Company_Address", "CompanyAddress");
                    document.getElementById("DeliveryReceipt_Terms").value = getClientValue(client || {}, "payment_Terms", "client_PaymentTerms", "Payment_Terms");
                    document.getElementById("DeliveryReceipt_ProjectTitle").textContent = title || "Project Title";
                    const itemsTableBody = document.getElementById("DeliveryReceipt_ItemsTableBody");
                    const branch = getClientValue(jobOrder, "store", "Store");
                    const rows = branch ? [createDeliveryReceiptBranchRow(branch)] : [];
                    rows.push(createDeliveryReceiptItemRow({
                        unit: getClientValue(jobOrder, "unit", "Unit"),
                        quantity: getClientValue(jobOrder, "quantity", "Quantity"),
                        requirement: getClientValue(jobOrder, "requirements", "Requirements"),
                        description: getClientValue(jobOrder, "description", "Description")
                    }));
                    itemsTableBody?.replaceChildren(...rows);
                    modal.hidden = true;
                };
                row.addEventListener("click", selectJobOrder);
                row.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectJobOrder();
                    }
                });
                tableBody.appendChild(row);
            });

            filterTableRows(tableBody, searchInput?.value || "");
        } catch (error) {
            console.error("Failed to load saved Job Orders:", error);
            tableBody.innerHTML = `<tr><td colspan="4">Saved Job Orders are unavailable.</td></tr>`;
        }
    });

    closeButton.addEventListener("click", () => {
        modal.hidden = true;
    });
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.hidden = true;
        }
    });
}

function initializeCollectionReceiptJobOrderPicker() {
    const openButton = document.getElementById("openCollectionReceiptJobOrderPicker");
    const closeButton = document.getElementById("closeCollectionReceiptJobOrderPicker");
    const modal = document.getElementById("collectionReceiptJobOrderPickerModal");
    const tableBody = document.getElementById("collectionReceiptJobOrderPickerTableBody");
    const searchInput = document.getElementById("collectionReceiptJobOrderPickerSearch");

    if (!openButton || !closeButton || !modal || !tableBody || openButton.dataset.initialized) {
        return;
    }

    openButton.dataset.initialized = "true";
    searchInput?.addEventListener("input", () => filterTableRows(tableBody, searchInput.value));

    openButton.addEventListener("click", async () => {
        modal.hidden = false;
        tableBody.innerHTML = `<tr><td colspan="3">Loading saved Job Orders...</td></tr>`;
        if (searchInput) {
            searchInput.value = "";
        }

        try {
            const jobOrders = await getJobOrders();
            if (!Array.isArray(jobOrders)) {
                throw new Error("Saved Job Orders are unavailable.");
            }
            if (jobOrders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3">No saved Job Orders found.</td></tr>`;
                return;
            }

            tableBody.replaceChildren();
            jobOrders.forEach(jobOrder => {
                const jobOrderId = getClientValue(jobOrder, "jobOrder_ID", "JobOrder_ID", "JobOrderID");
                const title = getClientValue(jobOrder, "title", "Title");
                const row = document.createElement("tr");
                [
                    jobOrderId,
                    title,
                    getClientValue(jobOrder, "date_Delivered", "Date_Delivered", "DateDelivered")
                ].forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value ?? "";
                    row.appendChild(cell);
                });
                row.tabIndex = 0;
                row.setAttribute("role", "button");

                const selectJobOrder = () => {
                    document.getElementById("CollectionReceipt_JobOrderID").value = jobOrderId;
                    document.getElementById("collectionReceiptJobOrderLookupInput").value = `${jobOrderId} - ${title || "Job Order"}`;
                    modal.hidden = true;
                };
                row.addEventListener("click", selectJobOrder);
                row.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectJobOrder();
                    }
                });
                tableBody.appendChild(row);
            });

            filterTableRows(tableBody, searchInput?.value || "");
        } catch (error) {
            console.error("Failed to load Collection Receipt Job Orders:", error);
            tableBody.innerHTML = `<tr><td colspan="3">Saved Job Orders are unavailable.</td></tr>`;
        }
    });

    closeButton.addEventListener("click", () => {
        modal.hidden = true;
    });
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.hidden = true;
        }
    });
}

function initializeCollectionReceiptSave() {
    const saveButton = document.getElementById("CollectionReceipt_Save");
    const jobOrderIdInput = document.getElementById("CollectionReceipt_JobOrderID");
    const lookupInput = document.getElementById("collectionReceiptJobOrderLookupInput");
    const form = document.getElementById("CollectionReceiptUploadForm");
    const fileInput = document.getElementById("CollectionReceipt_File");

    if (!saveButton || !jobOrderIdInput || !form || !fileInput || saveButton.dataset.initialized) {
        return;
    }

    saveButton.dataset.initialized = "true";
    saveButton.addEventListener("click", async () => {
        const jobOrderId = Number(jobOrderIdInput.value);
        const files = Array.from(fileInput.files || []);

        if (!Number.isInteger(jobOrderId) || jobOrderId <= 0) {
            alert("Select a saved Job Order before saving Collection Receipt photos.");
            return;
        }
        if (files.length === 0) {
            alert("Select at least one photo before saving.");
            return;
        }

        saveButton.disabled = true;
        let savedCount = 0;
        try {
            for (const file of files) {
                await CreateCollectionReceipt(file, jobOrderId);
                savedCount += 1;
            }
            form.clearSelectedFiles?.();
            jobOrderIdInput.value = "";
            if (lookupInput) {
                lookupInput.value = "";
            }
            alert(`Saved ${savedCount} Collection Receipt photo(s).`);
        } catch (error) {
            console.error("Failed to save Collection Receipt photos:", error);
            const savedNote = savedCount ? ` ${savedCount} photo(s) were saved before the error.` : "";
            alert(`Failed to save Collection Receipt photos.${savedNote} ${error.message}`);
        } finally {
            saveButton.disabled = false;
        }
    });
}

function initializeJobOrderSave() {
    const saveButton = document.getElementById("JobOrder_Save");

    if (!saveButton || saveButton.dataset.initialized) {
        return;
    }

    saveButton.dataset.initialized = "true";
    saveButton.addEventListener("click", async () => {
        const conformeId = document.getElementById("JobOrder_ConformeID")?.value.trim();
        const tableBody = document.getElementById("JobOrder_ItemsTableBody");
        const itemRows = Array.from(tableBody?.rows || []).filter(row => !row.classList.contains("quotation-branch-row"));

        if (!conformeId || !Number.isInteger(Number(conformeId))) {
            alert("Select a saved Conforme before saving the Job Order.");
            return;
        }
        if (itemRows.length === 0) {
            alert("The selected Conforme has no quotation items to save.");
            return;
        }

        const getBooleanChoice = name => {
            const selected = document.querySelector(`#JobOrderSection input[name="${name}"]:checked`);
            return selected ? selected.value === "with" : null;
        };
        const getDateValue = fieldId => document.getElementById(fieldId)?.value || null;
        const projectTitle = tableBody.closest("table")?.querySelector("thead th:first-child")?.textContent.trim() || "";
        const installationDate = getDateValue("JobOrder_InstallationDate");
        const targetDeliveryDate = getDateValue("JobOrder_TargetDeliveryDate");
        const dateDelivered = getDateValue("JobOrder_DateDelivered");
        const tiling = getBooleanChoice("JobOrder_Tiling");
        const eyelet = getBooleanChoice("JobOrder_Eyelet");
        const bleeding = getBooleanChoice("JobOrder_Bleeding");
        const jobOrders = [];
        let store = "";

        Array.from(tableBody.rows).forEach(row => {
            if (row.classList.contains("quotation-branch-row")) {
                store = row.cells[0]?.textContent.trim() || "";
                return;
            }

            const item = JSON.parse(row.dataset.jobOrderItem || "{}");
            const readItemField = cellIndex => row.cells[cellIndex]?.querySelector("input")?.value.trim() || null;
            const quantity = item.quantity === "" || item.quantity === null ? null : Number(item.quantity);

            jobOrders.push({
                Conforme_FileID: Number(conformeId),
                Title: projectTitle,
                Store: store || null,
                Requirements: item.requirements || null,
                Description: item.description || null,
                Quantity: Number.isFinite(quantity) ? quantity : null,
                Width: item.width === "" ? null : String(item.width),
                Length: item.length === "" ? null : String(item.length),
                Artist_Initial: readItemField(4),
                Production_Initial: readItemField(5),
                Remarks: readItemField(6),
                Installation_Date: installationDate,
                Target_Delivery: targetDeliveryDate,
                Date_Delivered: dateDelivered,
                Tiling: tiling,
                Eyelet: eyelet,
                Bleeding: bleeding,
                Status: "Pending"
            });
        });

        saveButton.disabled = true;
        let savedCount = 0;
        try {
            for (const jobOrder of jobOrders) {
                await CreateMarketingJobOrder(jobOrder);
                savedCount += 1;
            }
            clearJobOrderForm();
            alert(`Saved ${savedCount} Job Order item(s).`);
        } catch (error) {
            console.error("Failed to save Job Order:", error);
            const progress = savedCount ? ` ${savedCount} item(s) were saved before the error.` : "";
            alert(`Failed to save Job Order.${progress} ${error.message}`);
        } finally {
            saveButton.disabled = false;
        }
    });
}

function clearJobOrderForm() {
    const section = document.getElementById("JobOrderSection");
    section?.querySelectorAll("input").forEach(input => {
        if (input.type === "radio" || input.type === "checkbox") {
            input.checked = false;
        } else {
            input.value = "";
        }
    });
    section?.querySelectorAll("textarea").forEach(textarea => {
        textarea.value = "";
    });

    const tableBody = document.getElementById("JobOrder_ItemsTableBody");
    tableBody?.replaceChildren();
    const projectTitleHeader = tableBody?.closest("table")?.querySelector("thead th:first-child");
    if (projectTitleHeader) {
        projectTitleHeader.textContent = "Project Title";
    }
}

function filterTableRows(tableBody, query) {
    if (!tableBody) {
        return;
    }

    const term = (query || "").trim().toLowerCase();
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {
        const text = (row.textContent || "").toLowerCase();
        row.style.display = !term || text.includes(term) ? "" : "none";
    });
}

function getClientValue(client, ...propertyNames) {
    for (const propertyName of propertyNames) {
        if (client[propertyName] !== null && client[propertyName] !== undefined) {
            return client[propertyName];
        }
    }

    return "";
}

function selectClient(client) {
    const clientLookupInput = document.getElementById("clientLookupInput");
    if (clientLookupInput) {
        clientLookupInput.value = getClientValue(client, "client_ID", "Client_ID");
    }

    setClientDependentFieldsEnabled(true);
    setConformeFieldsEnabled(true);
}

function setClientDependentFieldsEnabled(enabled) {
    document.querySelectorAll("[data-client-dependent]")
        .forEach(field => {
            field.disabled = !enabled;
        });
}

function setConformeFieldsEnabled(enabled) {
    document.querySelectorAll("#ConformeSection input, #ConformeSection select, #ConformeSection textarea")
        .forEach(field => {
                if (![
                    "clientLookupInput",
                    "quotationOverviewLookupInput",
                    "Conforme_File"
                ].includes(field.id)) {
                field.disabled = !enabled;
            }
        });
}


// Switch between Marketing tabs
function switchTab(event, sectionId) {

    event.preventDefault();

    const links = document.querySelectorAll(".tab-nav a");

    links.forEach(link => {
        link.classList.remove("active");
    });

    event.currentTarget.classList.add("active");

    const contents = document.querySelectorAll(".tab-content");

    contents.forEach(content => {
        content.classList.remove("active-content");
        content.classList.add("hidden");
    });

    const target = document.getElementById(sectionId);

    if (target) {

        target.classList.remove("hidden");
        target.classList.add("active-content");

        // Load client records when Saved Records is opened
        if (sectionId === "savedRecordsSection") {
            loadClientsIntoTable();
            loadClientsProjectIntoTable();
            loadQuotationsIntoTable();
            loadConformeIntoTable();
            loadPurchaseOrdersIntoTable();
            loadJobOrdersIntoTable();
            loadDeliveryReceiptsIntoTable();
            loadCollectionReceiptsIntoTable();
        }
    }
}

async function loadClientsIntoTable() {

    const tableBody = document.getElementById("clientsTableBody");

    if (!tableBody) {
        console.error("clientsTableBody not found.");
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="6">Loading saved records...</td>
        </tr>
    `;

    try {
        const clients = await getClients();
        tableBody.innerHTML = "";

        if (!Array.isArray(clients)) {
            tableBody.innerHTML = `<tr><td colspan="6">Saved records are unavailable.</td></tr>`;
            return;
        }

        if (clients.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6">No saved client records found.</td></tr>`;
            return;
        }

        clients.forEach(client => {
            const row = document.createElement("tr");
            const values = [
                getClientValue(client, "client_ID", "Client_ID"),
                getClientValue(client, "client_Name", "Client_Name"),
                getClientValue(client, "client_Telephone", "Client_Telephone"),
                getClientValue(client, "client_Address", "Client_Address"),
                getClientValue(client, "tin", "client_TinNumber", "TIN", "Tin"),
                getClientValue(client, "payment_Terms", "client_PaymentTerms", "Payment_Terms")
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            row.addEventListener("click", () => selectClient(client));
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load clients:", error);
        tableBody.innerHTML = `<tr><td colspan="6">Saved records are unavailable because the API is offline.</td></tr>`;
    }
}

async function loadClientsProjectIntoTable() {
    const tableBody = document.getElementById("clientsProjectTableBody");

    if (!tableBody) {
        console.error("clientsProjectTableBody not found.");
        return;
    }

    tableBody.innerHTML = `<tr><td colspan="10">Loading saved client projects...</td></tr>`;

    try {
        const projects = await getClientsProject();
        tableBody.innerHTML = "";

        if (!Array.isArray(projects)) {
            tableBody.innerHTML = `<tr><td colspan="10">Saved client projects are unavailable.</td></tr>`;
            return;
        }

        if (projects.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10">No saved client projects found.</td></tr>`;
            return;
        }

        projects.forEach(project => {
            const row = document.createElement("tr");
            const values = [
                getClientValue(project, "project_ID", "Project_ID"),
                getClientValue(project, "client_ID", "Client_ID"),
                getClientValue(project, "attention", "Attention"),
                getClientValue(project, "business_Style", "Business_Style"),
                getClientValue(project, "client_Subject", "Client_Subject"),
                getClientValue(project, "representative", "Representative"),
                getClientValue(project, "contact_Person", "Contact_Person"),
                getClientValue(project, "account_Executive", "Account_Executive"),
                getClientValue(project, "date", "Date"),
                getClientValue(project, "time", "Time")
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load client projects:", error);
        tableBody.innerHTML = `<tr><td colspan="10">Saved client projects are unavailable because the API is offline.</td></tr>`;
    }
}

async function loadQuotationsIntoTable(
    tableBody = document.getElementById("savedQuotationsTableBody"),
    onRowSelect = null
) {
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `<tr><td colspan="7">Loading saved quotations...</td></tr>`;

    try {
        const [quotations, projects, clients] = await Promise.all([
            getQuotation(),
            getClientsProject(),
            getClients()
        ]);

        if (!Array.isArray(quotations) || !Array.isArray(projects) || !Array.isArray(clients)) {
            tableBody.innerHTML = `<tr><td colspan="7">Saved quotations are unavailable.</td></tr>`;
            return;
        }

        if (quotations.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7">No saved quotations found.</td></tr>`;
            return;
        }

        const normalizeId = value => String(value ?? "").trim().toLowerCase();
        const projectsById = new Map(projects.map(project => [
            normalizeId(getClientValue(project, "project_ID", "Project_ID", "ProjectID", "projectId")),
            project
        ]).filter(([projectId]) => projectId));
        const clientsById = new Map(clients.map(client => [
            normalizeId(getClientValue(client, "client_ID", "Client_ID", "ClientID", "clientId")),
            client
        ]).filter(([clientId]) => clientId));

        tableBody.innerHTML = "";
        quotations.forEach(quotation => {
            const projectId = getClientValue(quotation, "project_ID", "Project_ID", "ProjectID", "projectId");
            const project = projectsById.get(normalizeId(projectId));
            const clientId = getClientValue(project || {}, "client_ID", "Client_ID", "ClientID", "clientId");
            const client = clientsById.get(normalizeId(clientId));
            const values = [
                getClientValue(quotation, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId", "QS_ID", "qs_ID"),
                getClientValue(client || {}, "client_Name", "Client_Name", "Company_Name", "company_Name", "CompanyName"),
                getClientValue(project || {}, "attention", "Attention"),
                getClientValue(quotation, "title", "Title"),
                getClientValue(quotation, "overall_Total", "Overall_Total", "overallTotal", "OverallTotal", "total_Amount", "Total_Amount", "TotalAmount"),
                getClientValue(quotation, "start_Date", "Start_Date", "StartDate"),
                getClientValue(quotation, "end_Date", "End_Date", "EndDate")
            ];

            const row = document.createElement("tr");
            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            if (onRowSelect) {
                row.addEventListener("click", () => onRowSelect(values[0]));
            }
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load saved quotations:", error);
        tableBody.innerHTML = `<tr><td colspan="7">Saved quotations are unavailable because the API is offline.</td></tr>`;
    }
}

async function loadConformeIntoTable() {
    const tableBody = document.getElementById("savedConformeTableBody");
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `<tr><td colspan="4">Loading saved Conforme files...</td></tr>`;

    try {
        const [conformeRecords, quotations, projects, clients] = await Promise.all([
            getConforme(),
            getQuotation(),
            getClientsProject(),
            getClients()
        ]);

        if (![conformeRecords, quotations, projects, clients].every(Array.isArray)) {
            tableBody.innerHTML = `<tr><td colspan="4">Saved Conforme files are unavailable.</td></tr>`;
            return;
        }

        if (conformeRecords.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4">No saved Conforme files found.</td></tr>`;
            return;
        }

        const normalizeId = value => String(value ?? "").trim().toLowerCase();
        const quotationsById = new Map(quotations.map(quotation => [
            normalizeId(getClientValue(quotation, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId")),
            quotation
        ]).filter(([quotationId]) => quotationId));
        const projectsById = new Map(projects.map(project => [
            normalizeId(getClientValue(project, "project_ID", "Project_ID", "ProjectID", "projectId")),
            project
        ]).filter(([projectId]) => projectId));
        const clientsById = new Map(clients.map(client => [
            normalizeId(getClientValue(client, "client_ID", "Client_ID", "ClientID", "clientId")),
            client
        ]).filter(([clientId]) => clientId));

        tableBody.replaceChildren();
        conformeRecords.forEach(record => {
            const quotationId = getClientValue(record, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
            const quotation = quotationsById.get(normalizeId(quotationId));
            const projectId = getClientValue(quotation || {}, "project_ID", "Project_ID", "ProjectID", "projectId");
            const project = projectsById.get(normalizeId(projectId));
            const clientId = getClientValue(project || {}, "client_ID", "Client_ID", "ClientID", "clientId");
            const client = clientsById.get(normalizeId(clientId));
            const storedFileName = String(getClientValue(record, "fileName", "FileName", "filename"));
            const fileExtension = String(getClientValue(record, "fileExtension", "FileExtension", "extension"));
            const fileName = fileExtension && !storedFileName.toLowerCase().endsWith(fileExtension.toLowerCase())
                ? `${storedFileName}${fileExtension}`
                : storedFileName;
            const encodedFile = String(getClientValue(record, "fIleData", "fileData", "FileData"));
            const padding = encodedFile.endsWith("==") ? 2 : encodedFile.endsWith("=") ? 1 : 0;
            const fileSizeBytes = Math.max(0, Math.floor(encodedFile.length * 3 / 4) - padding);
            const fileSize = fileSizeBytes >= 1024 ** 2
                ? `${(fileSizeBytes / 1024 ** 2).toFixed(2)} MB`
                : `${Math.ceil(fileSizeBytes / 1024)} KB`;
            const values = [
                getClientValue(record, "fileID", "FileID", "fileId", "FileId"),
                getClientValue(client || {}, "client_Name", "Client_Name", "Company_Name", "company_Name", "CompanyName"),
                fileName,
                fileSizeBytes ? fileSize : "Unavailable"
            ];

            const row = document.createElement("tr");
            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            row.tabIndex = 0;
            row.setAttribute("role", "button");
            row.setAttribute("aria-label", `Preview ${fileName}`);
            row.addEventListener("click", () => openConformePreview(fileName, encodedFile));
            row.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openConformePreview(fileName, encodedFile);
                }
            });
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load saved Conforme files:", error);
        tableBody.innerHTML = `<tr><td colspan="4">Saved Conforme files are unavailable because the API is offline.</td></tr>`;
    }
}

async function loadPurchaseOrdersIntoTable() {
    const tableBody = document.getElementById("savedPurchaseOrderTableBody");
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `<tr><td colspan="4">Loading saved purchase orders...</td></tr>`;

    try {
        const [purchaseOrders, conformeRecords, quotations, projects, clients] = await Promise.all([
            getPurchaseOrders(),
            getConforme(),
            getQuotation(),
            getClientsProject(),
            getClients()
        ]);

        if (![purchaseOrders, conformeRecords, quotations, projects, clients].every(Array.isArray)) {
            tableBody.innerHTML = `<tr><td colspan="4">Saved purchase orders are unavailable.</td></tr>`;
            return;
        }

        if (purchaseOrders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4">No saved purchase orders found.</td></tr>`;
            return;
        }

        const normalizeId = value => String(value ?? "").trim().toLowerCase();
        const conformesById = new Map(conformeRecords.map(record => [
            normalizeId(getClientValue(record, "fileID", "FileID", "fileId", "FileId")),
            record
        ]).filter(([conformeId]) => conformeId));
        const quotationsById = new Map(quotations.map(quotation => [
            normalizeId(getClientValue(quotation, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId")),
            quotation
        ]).filter(([quotationId]) => quotationId));
        const projectsById = new Map(projects.map(project => [
            normalizeId(getClientValue(project, "project_ID", "Project_ID", "ProjectID", "projectId")),
            project
        ]).filter(([projectId]) => projectId));
        const clientsById = new Map(clients.map(client => [
            normalizeId(getClientValue(client, "client_ID", "Client_ID", "ClientID", "clientId")),
            client
        ]).filter(([clientId]) => clientId));

        tableBody.replaceChildren();
        purchaseOrders.forEach(record => {
            const conformeId = getClientValue(record, "Conforme_FileID", "conforme_FileID", "conformeFileID", "conformeId");
            const conforme = conformesById.get(normalizeId(conformeId));
            const quotationId = getClientValue(conforme || {}, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
            const quotation = quotationsById.get(normalizeId(quotationId));
            const projectId = getClientValue(quotation || {}, "project_ID", "Project_ID", "ProjectID", "projectId");
            const project = projectsById.get(normalizeId(projectId));
            const clientId = getClientValue(project || {}, "client_ID", "Client_ID", "ClientID", "clientId");
            const client = clientsById.get(normalizeId(clientId));
            const storedFileName = String(getClientValue(record, "fileName", "FileName", "filename"));
            const fileExtension = String(getClientValue(record, "fileExtension", "FileExtension", "extension"));
            const fileName = fileExtension && !storedFileName.toLowerCase().endsWith(fileExtension.toLowerCase())
                ? `${storedFileName}${fileExtension}`
                : storedFileName;
            const encodedFile = String(getClientValue(record, "fIleData", "fileData", "FileData"));
            const padding = encodedFile.endsWith("==") ? 2 : encodedFile.endsWith("=") ? 1 : 0;
            const fileSizeBytes = Math.max(0, Math.floor(encodedFile.length * 3 / 4) - padding);
            const fileSize = fileSizeBytes >= 1024 ** 2
                ? `${(fileSizeBytes / 1024 ** 2).toFixed(2)} MB`
                : `${Math.ceil(fileSizeBytes / 1024)} KB`;
            const values = [
                getClientValue(record, "fileID", "FileID", "fileId", "FileId", "purchaseOrder_ID", "PurchaseOrder_ID", "PurchaseOrderID", "purchaseOrderId", "PurchaseOrderId", "id", "Id"),
                getClientValue(client || {}, "client_Name", "Client_Name", "Company_Name", "company_Name", "CompanyName"),
                fileName,
                fileSizeBytes ? fileSize : "Unavailable"
            ];

            const row = document.createElement("tr");
            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            row.tabIndex = 0;
            row.setAttribute("role", "button");
            row.setAttribute("aria-label", `Preview ${fileName}`);
            row.addEventListener("click", () => openConformePreview(fileName, encodedFile));
            row.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openConformePreview(fileName, encodedFile);
                }
            });
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load saved purchase orders:", error);
        tableBody.innerHTML = `<tr><td colspan="4">Saved purchase orders are unavailable because the API is offline.</td></tr>`;
    }
}

async function loadJobOrdersIntoTable() {
    const tableBody = document.getElementById("savedJobOrdersTableBody");
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `<tr><td colspan="10">Loading saved Job Orders...</td></tr>`;

    try {
        const [jobOrders, conformeRecords, quotations, projects, clients] = await Promise.all([
            getJobOrders(),
            getConforme(),
            getQuotation(),
            getClientsProject(),
            getClients()
        ]);
        if (![jobOrders, conformeRecords, quotations, projects, clients].every(Array.isArray)) {
            tableBody.innerHTML = `<tr><td colspan="10">Saved Job Orders are unavailable.</td></tr>`;
            return;
        }
        if (jobOrders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10">No saved Job Orders found.</td></tr>`;
            return;
        }

        const normalizeId = value => String(value ?? "").trim().toLowerCase();
        const createIndex = (records, ...idProperties) => new Map(records.map(record => [
            normalizeId(getClientValue(record, ...idProperties)),
            record
        ]).filter(([id]) => id));
        const conformesById = createIndex(conformeRecords, "fileID", "FileID", "fileId", "FileId");
        const quotationsById = createIndex(quotations, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
        const projectsById = createIndex(projects, "project_ID", "Project_ID", "ProjectID", "projectId");
        const clientsById = createIndex(clients, "client_ID", "Client_ID", "ClientID", "clientId");
        const formatChoice = value => value === true ? "With" : value === false ? "Without" : "";

        tableBody.replaceChildren();
        jobOrders.forEach(jobOrder => {
            const conformeId = getClientValue(jobOrder, "conforme_FileID", "Conforme_FileID", "ConformeFileID");
            const conforme = conformesById.get(normalizeId(conformeId));
            const quotationId = getClientValue(conforme || {}, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
            const quotation = quotationsById.get(normalizeId(quotationId));
            const projectId = getClientValue(quotation || {}, "project_ID", "Project_ID", "ProjectID", "projectId");
            const project = projectsById.get(normalizeId(projectId));
            const clientId = getClientValue(project || {}, "client_ID", "Client_ID", "ClientID", "clientId");
            const client = clientsById.get(normalizeId(clientId));
            const row = document.createElement("tr");
            const values = [
                getClientValue(jobOrder, "jobOrder_ID", "JobOrder_ID", "JobOrderID"),
                getClientValue(client || {}, "client_Name", "Client_Name", "Company_Name", "company_Name", "CompanyName"),
                getClientValue(jobOrder, "title", "Title"),
                getClientValue(jobOrder, "installation_Date", "Installation_Date", "InstallationDate"),
                getClientValue(jobOrder, "target_Delivery", "Target_Delivery", "TargetDelivery"),
                getClientValue(jobOrder, "date_Delivered", "Date_Delivered", "DateDelivered"),
                formatChoice(getClientValue(jobOrder, "tiling", "Tiling")),
                formatChoice(getClientValue(jobOrder, "eyelet", "Eyelet")),
                formatChoice(getClientValue(jobOrder, "bleeding", "Bleeding")),
                getClientValue(jobOrder, "status", "Status")
            ];
            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load saved Job Orders:", error);
        tableBody.innerHTML = `<tr><td colspan="10">Saved Job Orders are unavailable because the API is offline.</td></tr>`;
    }
}

async function loadDeliveryReceiptsIntoTable() {
    const tableBody = document.getElementById("savedDeliveryReceiptsTableBody");
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `<tr><td colspan="6">Loading saved delivery receipts...</td></tr>`;

    try {
        const receipts = await getDeliveryReceipts();
        if (!Array.isArray(receipts)) {
            tableBody.innerHTML = `<tr><td colspan="6">Saved delivery receipts are unavailable.</td></tr>`;
            return;
        }
        if (receipts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6">No saved delivery receipts found.</td></tr>`;
            return;
        }

        tableBody.replaceChildren();
        receipts.forEach(receipt => {
            const row = document.createElement("tr");
            [
                getClientValue(receipt, "clientName", "ClientName"),
                getClientValue(receipt, "title", "Title"),
                getClientValue(receipt, "address", "Address"),
                getClientValue(receipt, "terms", "Terms"),
                getClientValue(receipt, "date", "Date"),
                getClientValue(receipt, "time", "Time")
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load saved delivery receipts:", error);
        tableBody.innerHTML = `<tr><td colspan="6">Saved delivery receipts are unavailable because the API is offline.</td></tr>`;
    }
}

async function loadCollectionReceiptsIntoTable() {
    const tableBody = document.getElementById("savedCollectionReceiptsTableBody");
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `<tr><td colspan="4">Loading saved Collection Receipts...</td></tr>`;

    try {
        const [receipts, jobOrders, conformeRecords, quotations, projects, clients] = await Promise.all([
            getCollectionReceipts(),
            getJobOrders(),
            getConforme(),
            getQuotation(),
            getClientsProject(),
            getClients()
        ]);
        if (![receipts, jobOrders, conformeRecords, quotations, projects, clients].every(Array.isArray)) {
            tableBody.innerHTML = `<tr><td colspan="4">Saved Collection Receipts are unavailable.</td></tr>`;
            return;
        }
        if (receipts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4">No saved Collection Receipts found.</td></tr>`;
            return;
        }

        const normalizeId = value => String(value ?? "").trim().toLowerCase();
        const createIndex = (records, ...idProperties) => new Map(records.map(record => [
            normalizeId(getClientValue(record, ...idProperties)),
            record
        ]).filter(([id]) => id));
        const jobOrdersById = createIndex(jobOrders, "jobOrder_ID", "JobOrder_ID", "JobOrderID");
        const conformesById = createIndex(conformeRecords, "fileID", "FileID", "fileId", "FileId");
        const quotationsById = createIndex(quotations, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
        const projectsById = createIndex(projects, "project_ID", "Project_ID", "ProjectID", "projectId");
        const clientsById = createIndex(clients, "client_ID", "Client_ID", "ClientID", "clientId");

        tableBody.replaceChildren();
        receipts.forEach(receipt => {
            const jobOrder = jobOrdersById.get(normalizeId(getClientValue(receipt, "jobOrderID", "JobOrderID")));
            const conformeId = getClientValue(jobOrder || {}, "conforme_FileID", "Conforme_FileID", "ConformeFileID");
            const conforme = conformesById.get(normalizeId(conformeId));
            const quotationId = getClientValue(conforme || {}, "quotation_ID", "Quotation_ID", "QuotationID", "quotationId");
            const quotation = quotationsById.get(normalizeId(quotationId));
            const projectId = getClientValue(quotation || {}, "project_ID", "Project_ID", "ProjectID", "projectId");
            const project = projectsById.get(normalizeId(projectId));
            const clientId = getClientValue(project || {}, "client_ID", "Client_ID", "ClientID", "clientId");
            const client = clientsById.get(normalizeId(clientId));
            const storedFileName = String(getClientValue(receipt, "fileName", "FileName"));
            const fileExtension = String(getClientValue(receipt, "fileExtension", "FileExtension"));
            const fileName = fileExtension && !storedFileName.toLowerCase().endsWith(fileExtension.toLowerCase())
                ? `${storedFileName}${fileExtension}`
                : storedFileName;
            const encodedFile = String(getClientValue(receipt, "fileData", "FileData"));
            const padding = encodedFile.endsWith("==") ? 2 : encodedFile.endsWith("=") ? 1 : 0;
            const fileSizeBytes = Math.max(0, Math.floor(encodedFile.length * 3 / 4) - padding);
            const fileSize = fileSizeBytes >= 1024 ** 2
                ? `${(fileSizeBytes / 1024 ** 2).toFixed(2)} MB`
                : `${Math.ceil(fileSizeBytes / 1024)} KB`;
            const row = document.createElement("tr");
            [
                getClientValue(receipt, "collectionReceipt_ID", "CollectionReceipt_ID", "CollectionReceiptID"),
                getClientValue(client || {}, "client_Name", "Client_Name", "Company_Name", "company_Name", "CompanyName"),
                fileName,
                fileSizeBytes ? fileSize : "Unavailable"
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });
            row.tabIndex = 0;
            row.setAttribute("role", "button");
            row.setAttribute("aria-label", `Preview ${fileName}`);
            row.addEventListener("click", () => openCollectionReceiptPreview(fileName, encodedFile, fileExtension));
            row.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openCollectionReceiptPreview(fileName, encodedFile, fileExtension);
                }
            });
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load saved Collection Receipts:", error);
        tableBody.innerHTML = `<tr><td colspan="4">Saved Collection Receipts are unavailable because the API is offline.</td></tr>`;
    }
}

function initializeConformePreview() {
    const modal = document.getElementById("conformePreviewModal");
    const closeButton = document.getElementById("closeConformePreview");

    if (!modal || !closeButton || modal.dataset.initialized) {
        return;
    }

    modal.dataset.initialized = "true";
    closeButton.addEventListener("click", closeConformePreview);
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeConformePreview();
        }
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.hidden) {
            closeConformePreview();
        }
    });
}

function openConformePreview(fileName, encodedFile) {
    const modal = document.getElementById("conformePreviewModal");
    const frame = document.getElementById("conformePreviewFrame");
    const image = document.getElementById("collectionReceiptPreviewImage");
    const title = document.getElementById("conformePreviewTitle");
    const base64Data = String(encodedFile || "").replace(/^data:.*;base64,/, "").replace(/\s/g, "");

    if (!modal || !frame || !title || !base64Data) {
        alert("This Conforme record does not contain a previewable PDF.");
        return;
    }

    try {
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let index = 0; index < binaryData.length; index += 1) {
            bytes[index] = binaryData.charCodeAt(index);
        }

        closeConformePreview();
        const previewUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
        modal.dataset.previewUrl = previewUrl;
        if (image) {
            image.hidden = true;
        }
        frame.hidden = false;
        frame.src = previewUrl;
        title.textContent = fileName;
        modal.hidden = false;
    } catch (error) {
        console.error("Failed to open Conforme preview:", error);
        alert("The selected Conforme document could not be previewed.");
    }
}

function openCollectionReceiptPreview(fileName, encodedFile, fileExtension) {
    const modal = document.getElementById("conformePreviewModal");
    const frame = document.getElementById("conformePreviewFrame");
    const image = document.getElementById("collectionReceiptPreviewImage");
    const title = document.getElementById("conformePreviewTitle");
    const base64Data = String(encodedFile || "").replace(/^data:.*;base64,/, "").replace(/\s/g, "");
    const mimeTypeByExtension = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".svg": "image/svg+xml",
        ".avif": "image/avif",
        ".tif": "image/tiff",
        ".tiff": "image/tiff"
    };
    const mimeType = mimeTypeByExtension[String(fileExtension || "").toLowerCase()];

    if (!modal || !frame || !image || !title || !base64Data || !mimeType) {
        alert("This Collection Receipt does not contain a previewable image.");
        return;
    }

    try {
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let index = 0; index < binaryData.length; index += 1) {
            bytes[index] = binaryData.charCodeAt(index);
        }

        closeConformePreview();
        const previewUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
        modal.dataset.previewUrl = previewUrl;
        frame.hidden = true;
        image.hidden = false;
        image.src = previewUrl;
        image.alt = fileName;
        title.textContent = fileName;
        modal.hidden = false;
    } catch (error) {
        console.error("Failed to open Collection Receipt image preview:", error);
        alert("The selected Collection Receipt image could not be previewed.");
    }
}

function closeConformePreview() {
    const modal = document.getElementById("conformePreviewModal");
    const frame = document.getElementById("conformePreviewFrame");
    const image = document.getElementById("collectionReceiptPreviewImage");
    if (!modal) {
        return;
    }

    if (modal.dataset.previewUrl) {
        URL.revokeObjectURL(modal.dataset.previewUrl);
        delete modal.dataset.previewUrl;
    }
    if (frame) {
        frame.src = "about:blank";
        frame.hidden = false;
    }
    if (image) {
        image.removeAttribute("src");
        image.alt = "";
        image.hidden = true;
    }
    modal.hidden = true;
}

