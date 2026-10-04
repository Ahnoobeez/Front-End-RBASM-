const API_BASE_URL = "http://localhost:5073/api";
async function getLocalMaterials() {
    const response = await fetch(`${API_BASE_URL}/Inventory/GetLocalMaterials`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`Failed to load materials (${response.status}).`);
    }

    return await response.json();
}

async function getLocalInventory() {
    const response = await fetch(`${API_BASE_URL}/Inventory/GetLocalInventory`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`Failed to load inventory (${response.status}).`);
    }

    return await response.json();
}

async function getLocalPurchaseMaterials() {
    const response = await fetch(`${API_BASE_URL}/Inventory/GetLocalPurchaseMaterial`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`Failed to load purchased materials (${response.status}).`);
    }

    return await response.json();
}

async function addLocalPurchaseMaterial(purchaseMaterial) {
    const response = await fetch(`${API_BASE_URL}/Inventory/AddLocalPurchaseMaterial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseMaterial)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save purchased material (${response.status}): ${errorText}`);
    }

    return await response.json();
}

async function updateLocalPurchaseMaterial(purchaseMaterial) {
    const response = await fetch(`${API_BASE_URL}/Inventory/UpdateLocalPurchaseMaterial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseMaterial)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update purchased material (${response.status}): ${errorText}`);
    }

    return await response.json();
}

async function addLocalMaterials(material) {
    const response = await fetch(`${API_BASE_URL}/Inventory/AddLocalMaterials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(material)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save material (${response.status}): ${errorText}`);
    }

    return await response.json();
}

async function addLocalInventory(inventory) {
    const response = await fetch(`${API_BASE_URL}/Inventory/AddLocalInventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventory)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save inventory (${response.status}): ${errorText}`);
    }

    return await response.json();
}

async function updateLocalMaterials(material) {
    const response = await fetch(`${API_BASE_URL}/Inventory/UpdateLocalMaterials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(material)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update material (${response.status}): ${errorText}`);
    }

    return await response.json();
}

async function updateLocalInventory(inventory) {
    const response = await fetch(`${API_BASE_URL}/Inventory/UpdateLocalInventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventory)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update inventory (${response.status}): ${errorText}`);
    }

    return await response.json();
}

async function getClients() {

    const response = await fetch(`${API_BASE_URL}/Clients/GetLocalClients`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve clients.");
    }

    return await response.json();
} 

async function getProductionClients() {

    const response = await fetch(`${API_BASE_URL}/Production/GetAllLocalClients`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve clients.");
    }

    return await response.json();
}

async function CreateClients() {
        const client_Name = document.getElementById('Client_CompanyName');
        const Client_Name = client_Name.value;

        const client_Telephone = document.getElementById('Client_Telephone');
        const Client_Telephone = client_Telephone.value;

        const client_Address = document.getElementById('Client_CompanyAddress');
        const Client_Address = client_Address.value;

        const client_PaymentTerms = document.getElementById('Client_PaymentTerms');
        const Client_PaymentTerms = client_PaymentTerms.value;

        const client_TinNumber = document.getElementById('Client_TinNumber');
        const Client_TinNumber = client_TinNumber.value;

        const client_ContactPerson = document.getElementById('Client_ContactPerson');
        const Client_ContactPerson = client_ContactPerson.value;

        const client_EmailAddress = document.getElementById('Client_EmailAddress');
        const Client_EmailAddress = client_EmailAddress.value;
        
        const payload = { Client_Name: Client_Name, Client_Telephone: Client_Telephone, Client_Address: Client_Address, Payment_Terms: Client_PaymentTerms, TIN: Client_TinNumber, ContactPerson: Client_ContactPerson, EmailAddress: Client_EmailAddress }
        console.log(payload);
    try {
        const response = await fetch((`${API_BASE_URL}/Clients/AddLocalClients`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        console.log(payload);
        // CHANGE THIS: Read the error body before throwing
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
        }

        const textData = await response.text();
        console.log('Success:', textData);

        [
            'Client_CompanyName',
            'Client_Telephone',
            'Client_CompanyAddress',
            'Client_PaymentTerms',
            'Client_TinNumber',
            'Client_ContactPerson',
            'Client_EmailAddress'
        ].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });

    } catch (error) {
        console.error('Error details:', error.message);
    } 
}


async function getClientsProject() {

    const response = await fetch(`${API_BASE_URL}/Marketing/GetLocalClientsProject`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve clients.");
    }

    return await response.json();
} 

async function getProductionClientsProject() {

    const response = await fetch(`${API_BASE_URL}/Production/GetLocalClientsProject`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve clients.");
    }

    return await response.json();
} 


async function CreateClientsProject() {
        const client_ID = document.getElementById('clientLookupInput');
        const Client_ID = client_ID.value;

        const attention = document.getElementById('ProjectRequest_Attention');
        const Attention = attention.value;

        const business_Style = document.getElementById('ProjectRequest_BusinessStyle');
        const Business_Style = business_Style.value;

        const client_Subject = document.getElementById('ProjectRequest_ClientSubject');
        const Client_Subject = client_Subject.value;

        const representative = document.getElementById('ProjectRequest_Representative');
        const Representative = representative.value;

        const contact_Person = document.getElementById('ProjectRequest_ContactPerson');
        const Contact_Person = contact_Person.value;

        const account_Executive = document.getElementById('ProjectRequest_AccountExecutive');
        const Account_Executive = account_Executive.value;
        
        const payload = { Client_ID: Client_ID, Attention: Attention, Business_Style: Business_Style, Client_Subject: Client_Subject, Representative: Representative, Contact_Person: Contact_Person, Account_Executive: Account_Executive }
        console.log(payload);
    try {
        const response = await fetch((`${API_BASE_URL}/Marketing/AddLocalClientsProject`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        console.log(payload);
        // CHANGE THIS: Read the error body before throwing
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
        }

        const textData = await response.text();
        console.log('Success:', textData);

        [
            'ProjectRequest_ProjectID',
            'ProjectRequest_Attention',
            'ProjectRequest_BusinessStyle',
            'ProjectRequest_ClientSubject',
            'ProjectRequest_Representative',
            'ProjectRequest_ContactPerson',
            'ProjectRequest_AccountExecutive'
        ].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });
    } catch (error) {
        console.error('Error details:', error.message);
    } 
            
}

async function getQuotation() {

    const response = await fetch(`${API_BASE_URL}/Marketing/GetLocalQuotations`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve quotations.");
    }

    return await response.json();
} 

async function getProductionQuotation() {

    const response = await fetch(`${API_BASE_URL}/Production/GetLocalQuotations`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve quotations.");
    }

    return await response.json();
} 

async function getConforme() {
    const response = await fetch(`${API_BASE_URL}/Marketing/GetLocalConforme`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve saved Conforme files.");
    }

    return await response.json();
}

async function getProductionConforme() {
    const response = await fetch(`${API_BASE_URL}/Production/GetLocalConforme`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve saved Conforme files.");
    }

    return await response.json();
}

async function getPurchaseOrders() {
    const response = await fetch(`${API_BASE_URL}/Marketing/GetLocalPurchaseOrder`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve saved purchase orders.");
    }

    return await response.json();
}

async function getMarketingJobOrders() {
    const response = await fetch(`${API_BASE_URL}/Marketing/GetLocalJobOrder`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve saved Job Orders.");
    }

    return await response.json();
}

async function getProductionJobOrders() {
    const response = await fetch(`${API_BASE_URL}/Production/GetLocalJobOrder`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve saved Job Orders.");
    }

    return await response.json();
}

async function getTechnicalJobOrders() {
    const response = await fetch(`${API_BASE_URL}/Technical/GetLocalJobOrder`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve saved Job Orders.");
    }

    return await response.json();
}


async function getDeliveryReceipts() {
    const response = await fetch(`${API_BASE_URL}/Marketing/GetLocalDeliveryReceipts`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve saved delivery receipts.");
    }

    return await response.json();
}

async function getCollectionReceipts() {
    const response = await fetch(`${API_BASE_URL}/Marketing/GetLocalCollectionReceipts`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve saved Collection Receipts.");
    }

    return await response.json();
}

async function getQuotationStore() {

    const response = await fetch(`${API_BASE_URL}/Marketing/GetLocalQuotationStore`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve quotations.");
    }

    return await response.json();
} 

async function getQuotationItems() {
    const response = await fetch(`${API_BASE_URL}/Marketing/GetLocalQuotationItems`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Failed to retrieve quotation items.");
    }

    return await response.json();
}

async function CreateMarketingJobOrder(jobOrder) {
    const response = await fetch(`${API_BASE_URL}/Marketing/AddLocalJobOrder`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jobOrder)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
    }

    return await response.text();
}

async function CreateProductionJobOrder(jobOrder) {
    const response = await fetch(`${API_BASE_URL}/Production/AddLocalJobOrder`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jobOrder)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
    }

    return await response.text();
}

async function CreateTechnicalJobOrder(jobOrder) {
    const response = await fetch(`${API_BASE_URL}/Technical/AddLocalJobOrder`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jobOrder)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
    }

    return await response.text();
}


async function CreateDeliveryReceipt(deliveryReceipt) {
    const response = await fetch(`${API_BASE_URL}/Marketing/AddLocalDeliveryReceipts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(deliveryReceipt)
    });

    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - Details: ${responseText}`);
    }

    let savedReceipt;
    try {
        savedReceipt = JSON.parse(responseText);
    } catch {
        savedReceipt = responseText;
    }

    const receiptRecord = Array.isArray(savedReceipt) ? savedReceipt[0] : savedReceipt;
    const deliveryIdEntry = Object.entries(receiptRecord || {}).find(
        ([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, "") === "deliveryid"
    );
    const deliveryId = typeof receiptRecord === "number" || typeof receiptRecord === "string"
        ? receiptRecord
        : deliveryIdEntry?.[1];
    if (deliveryId === undefined || deliveryId === null || deliveryId === "") {
        throw new Error("The receipt API response did not include a Delivery_ID.");
    }

    return deliveryId;
}

async function CreateCollectionReceipt(file, jobOrderId) {
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
        throw new Error("Collection Receipt uploads must be images no larger than 2 MB.");
    }

    const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
    });
    const payload = {
        FileName: file.name,
        FileExtension: `.${file.name.split(".").pop().toLowerCase()}`,
        FileData: fileData,
        JobOrderID: Number(jobOrderId),
        Status: "Pending"
    };

    const response = await fetch(`${API_BASE_URL}/Marketing/AddLocalCollectionReceipt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
    }

    return await response.text();
}

async function CreateDeliveryFile(file, deliveryId, fileRole) {
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
        throw new Error("Each delivery receipt upload must be an image no larger than 2 MB.");
    }

    const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
    });
    const payload = {
        Delivery_ID: Number(deliveryId),
        File_Role: fileRole,
        File_Name: file.name,
        File_Extension: `.${file.name.split(".").pop().toLowerCase()}`,
        File_Data: fileData
    };

    const response = await fetch(`${API_BASE_URL}/Marketing/AddLocalDeliveryFiles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
    }

    return await response.text();
}


async function CreateQuotation() {
        const project_ID = document.getElementById('projectRequestLookupInput');
        const Project_ID = project_ID.value;

        const title = document.getElementById('Quotation_Title');
        const Title = title.value;

        const sub_Total = document.getElementById('Quotation_SubTotal');
        const Sub_Total = sub_Total.value;

        const less_Discount = document.getElementById('Quotation_LessDiscount');
        const Less_Discount = less_Discount.value;

        const ingress_and_Engress = document.getElementById('Quotation_IngressEgress');
        const Ingress_and_Engress = ingress_and_Engress.value;

        const overall_Total = document.getElementById('Quotation_TotalAmount');
        const Overall_Total = overall_Total.value;

        const calledAt = new Date();
        const Start_Date = `${calledAt.getFullYear()}-${String(calledAt.getMonth() + 1).padStart(2, '0')}-${String(calledAt.getDate()).padStart(2, '0')}`;
        const Time = `${String(calledAt.getHours()).padStart(2, '0')}:${String(calledAt.getMinutes()).padStart(2, '0')}:${String(calledAt.getSeconds()).padStart(2, '0')}`;

        const startDateInput = document.getElementById('Quotation_StartDate');
        const timeInput = document.getElementById('Quotation_Time');
        if (startDateInput) {
            startDateInput.value = Start_Date;
        }
        if (timeInput) {
            timeInput.value = Time;
        }

        const end_Date = document.getElementById('Quotation_EndDate');
        const End_Date = end_Date.value;
        
        const payload = { Project_ID: Project_ID, Title: Title, Sub_Total: Sub_Total, Less_Discount: Less_Discount, Ingress_and_Engress: Ingress_and_Engress, Overall_Total: Overall_Total, Start_Date: Start_Date, Time: Time, End_Date: End_Date }
        console.log(payload);
    try {
        const response = await fetch((`${API_BASE_URL}/Marketing/AddLocalQuotations`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        console.log(payload);
        // CHANGE THIS: Read the error body before throwing
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
        }

        const createdQuotation = await response.json();
        const quotationIdEntry = Object.entries(createdQuotation || {}).find(
            ([key]) => key.toLowerCase().replace(/[^a-z]/g, '') === 'quotationid'
        );
        const quotationId = quotationIdEntry?.[1] ?? createdQuotation?.id ?? createdQuotation?.Id;
        if (quotationId === undefined || quotationId === null || quotationId === '') {
            throw new Error('The saved quotation response did not include a quotation ID.');
        }

        return String(quotationId);
    } catch (error) {
        console.error('Error details:', error.message);
        throw error;
    } 
            
}

async function CreateQuotationItems(qsId) {
    const tableBody = document.getElementById("Quotation_ItemsTableBody");
    const table = tableBody?.closest("table");
    const title = table?.querySelector("thead th:first-child")?.textContent.trim() || "";
    const resolvedQuotationId = qsId || document.getElementById("QS_ID")?.value.trim() || "";

    if (!tableBody) {
        throw new Error("The Project Items table was not found.");
    }

    const rows = Array.from(tableBody.rows).filter(
        row => !row.classList.contains("quotation-branch-row")
    );
    if (rows.length === 0) {
        throw new Error("There are no Project Item detail rows to save.");
    }

    const payloads = rows.map(row => {
        let record;
        try {
            record = JSON.parse(row.dataset.record || "{}");
        } catch {
            record = {};
        }

        row.querySelectorAll("[data-edit-field]").forEach(input => {
            record[input.dataset.editField] = input.value.trim();
        });

        const cellText = index => row.cells[index]?.textContent.trim() || "";
        const titleParts = row.cells[0]?.querySelectorAll("span") || [];
        const isBranchRow = record.type === "branch" || row.classList.contains("quotation-branch-row");
        const payload = {
            Title: title,
            Branch: record.branch || (isBranchRow ? cellText(0) : ""),
            Requirements: isBranchRow ? "" : (record.requirement ?? titleParts[0]?.textContent.trim() ?? cellText(0)),
            Description: isBranchRow ? "" : (record.description ?? titleParts[1]?.textContent.trim() ?? ""),
            Width: isBranchRow ? "" : (record.width ?? cellText(1)),
            Height: isBranchRow ? "" : (record.height ?? cellText(2)),
            Quantity: isBranchRow ? "" : (record.quantity ?? cellText(3)),
            UnitPrice: isBranchRow ? "" : (record.unitPrice ?? cellText(4)),
            TotalAmount: isBranchRow ? "" : (record.amount ?? cellText(5)),
            QS_ID: resolvedQuotationId
        };

        return payload;
    });

    for (const [index, payload] of payloads.entries()) {
        const response = await fetch(`${API_BASE_URL}/Marketing/AddLocalQuotationItems`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Row ${index + 1} failed: HTTP ${response.status} - ${errorText}`);
        }
        await response.text();
    }

    return payloads.length;
}

async function CreateQuotationStore(quotationId) {

    const store = document.getElementById('Quotation_Branch');
    const Store = store?.value.trim() || '';

    const quotation_ID = quotationId || document.getElementById('Quotation_ID')?.value.trim() || '';

        
        const payload = { Store: Store, Quotation_ID: quotation_ID }
        console.log(payload);
    try {
        const response = await fetch((`${API_BASE_URL}/Marketing/AddLocalQuotationStore`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        console.log(payload);
        // CHANGE THIS: Read the error body before throwing
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
        }

        const savedStore = await response.json();
        const savedStoreRecord = Array.isArray(savedStore) ? savedStore[0] : savedStore;
        const qsIdEntry = Object.entries(savedStoreRecord || {}).find(
            ([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, '') === 'qsid'
        );
        const qsId = qsIdEntry?.[1] ?? savedStoreRecord?.qsId ?? savedStoreRecord?.id ?? savedStoreRecord?.Id;
        if (qsId === undefined || qsId === null || qsId === '') {
            throw new Error('The saved quotation store response did not include a QS_ID.');
        }

        return String(qsId);
    } catch (error) {
        console.error('Error details:', error.message);
        throw error;
    } 
            
}


async function CreateConforme(file, quotationId) {
    if (!file) {
        throw new Error("A conforme PDF file is required.");
    }
    if (!quotationId) {
        throw new Error("A quotation overview is required.");
    }

    const numericQuotationId = Number(quotationId);
    if (!Number.isInteger(numericQuotationId)) {
        throw new Error("The selected quotation ID must be a number.");
    }

    const fIleData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
    });
    const payload = {
        fileName: file.name,
        fileExtension: `.${file.name.split(".").pop().toLowerCase()}`,
        fIleData,
        quotation_ID: numericQuotationId,
        status: "Pending"
    };

    const response = await fetch(`${API_BASE_URL}/Marketing/AddLocalConforme`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
    }

    return await response.text();
}


async function CreatePurchaseOrder(file, conformeId) {
    if (!file) {
        throw new Error("A purchase order PDF file is required.");
    }
    if (!conformeId) {
        throw new Error("A saved Conforme must be selected.");
    }

    const numericConformeId = Number(conformeId);
    if (!Number.isInteger(numericConformeId)) {
        throw new Error("The selected Conforme ID must be a number.");
    }

    const fIleData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
    });
    const payload = {
        fileName: file.name,
        fileExtension: `.${file.name.split(".").pop().toLowerCase()}`,
        fIleData,
        Conforme_FileID: numericConformeId,
        status: "Pending"
    };

    const response = await fetch(`${API_BASE_URL}/Marketing/AddlocalPurchaseOrder`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - Details: ${errorText}`);
    }

    return await response.text();
}

