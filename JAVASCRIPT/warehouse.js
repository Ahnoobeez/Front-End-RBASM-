function initializeWarehousePage() {
	const purchasedMaterialsModal = document.getElementById('purchasedMaterialsModal');
	const openPurchasedMaterialsModal = document.getElementById('openPurchasedMaterialsModal');
	const closePurchasedMaterialsModal = document.getElementById('closePurchasedMaterialsModal');
	const addPurchasedMaterialForm = document.getElementById('addPurchasedMaterialForm');
	const addPurchasedMaterialPicker = document.getElementById('addPurchasedMaterialPicker');
	const purchasedMaterialAddError = document.getElementById('purchasedMaterialAddError');
	const submitPurchasedMaterial = document.getElementById('submitPurchasedMaterial');
	const purchasedMaterialsEditModal = document.getElementById('purchasedMaterialsEditModal');
	const openPurchasedMaterialsEditModal = document.getElementById('openPurchasedMaterialsEditModal');
	const closePurchasedMaterialsEditModal = document.getElementById('closePurchasedMaterialsEditModal');
	const purchaseMaterialPicker = document.getElementById('purchaseMaterialPicker');
	const purchasedMaterialsTable = document.querySelector('.purchased-materials-table:not(.edit-material-table) tbody');
	const purchasedMaterialEditRow = document.getElementById('purchasedMaterialEditRow');
	const savePurchasedMaterialChanges = document.getElementById('savePurchasedMaterialChanges');
	const purchasedMaterialEditError = document.getElementById('purchasedMaterialEditError');
	const inventoryTableBody = document.getElementById('inventoryTableBody');
	const inventoryApiStatus = document.getElementById('inventoryApiStatus');
	const inventoryAddModal = document.getElementById('inventoryAddModal');
	const openInventoryAddModal = document.getElementById('openInventoryAddModal');
	const closeInventoryAddModal = document.getElementById('closeInventoryAddModal');
	const addInventoryMaterialForm = document.getElementById('addInventoryMaterialForm');
	const inventoryAddError = document.getElementById('inventoryAddError');
	const submitInventoryMaterial = document.getElementById('submitInventoryMaterial');
	const inventoryEditModal = document.getElementById('inventoryEditModal');
	const openInventoryEditModal = document.getElementById('openInventoryEditModal');
	const closeInventoryEditModal = document.getElementById('closeInventoryEditModal');
	const inventoryMaterialPicker = document.getElementById('inventoryMaterialPicker');
	const inventoryMaterialEditRow = document.getElementById('inventoryMaterialEditRow');
	const saveInventoryMaterialChanges = document.getElementById('saveInventoryMaterialChanges');
	const inventoryEditError = document.getElementById('inventoryEditError');
	let selectedPurchasedMaterialId = null;
	let purchasedMaterialRecords = [];
	let purchasedMaterialEditMaterials = [];
	let selectedMaterialId = null;
	let inventoryMaterialRecords = [];
	let inventoryRecords = [];

	const getRecordValue = function (record, propertyName) {
		const pascalName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
		return record[propertyName] ?? record[pascalName] ?? '';
	};

	const normalizeApiList = function (result) {
		if (Array.isArray(result)) {
			return result;
		}
		const wrappedValue = result?.value ?? result?.Value;
		if (Array.isArray(wrappedValue)) {
			return wrappedValue;
		}
		if (wrappedValue && typeof wrappedValue === 'object') {
			return [wrappedValue];
		}
		return result && typeof result === 'object' ? [result] : [];
	};

	const setPurchasedMaterialError = function (message) {
		if (purchasedMaterialAddError) {
			purchasedMaterialAddError.textContent = message;
			purchasedMaterialAddError.hidden = !message;
		}
	};

	const setPurchasedMaterialEditError = function (message) {
		if (purchasedMaterialEditError) {
			purchasedMaterialEditError.textContent = message;
			purchasedMaterialEditError.hidden = !message;
		}
	};

	const formatPurchaseDate = function (value) {
		return value ? String(value).slice(0, 10) : '';
	};

	const formatPurchasePrice = function (value) {
		const price = Number(value);
		return value !== '' && value != null && Number.isFinite(price)
			? `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
			: '';
	};

	const renderPurchasedMaterials = function (purchases, materials) {
		purchasedMaterialsTable.replaceChildren();
		if (!purchases.length) {
			const row = purchasedMaterialsTable.insertRow();
			const cell = row.insertCell();
			cell.colSpan = 8;
			cell.textContent = 'No purchased materials found.';
			return;
		}

		purchases.forEach(function (purchase) {
			const materialId = getRecordValue(purchase, 'material_ID');
			const material = materials.find(function (record) {
				return Number(getRecordValue(record, 'material_ID')) === Number(materialId);
			}) || {};
			const row = purchasedMaterialsTable.insertRow();
			row.dataset.purchasedId = String(getRecordValue(purchase, 'purchased_ID') ?? '');
			[
				getRecordValue(material, 'code_Name'),
				getRecordValue(material, 'item_Name'),
				getRecordValue(purchase, 'supplier_Name'),
				getRecordValue(purchase, 'sI_No'),
				getRecordValue(purchase, 'quantity'),
				formatPurchasePrice(getRecordValue(purchase, 'unit_price')),
				formatPurchaseDate(getRecordValue(purchase, 'sI_Date')),
				formatPurchaseDate(getRecordValue(purchase, 'date_Received_Item'))
			].forEach(function (value) {
				row.insertCell().textContent = String(value ?? '').trim();
			});
		});
	};

	const refreshPurchasedMaterialsTable = async function () {
		const [purchasesResult, materialsResult] = await Promise.all([
			getLocalPurchaseMaterials(),
			getLocalMaterials()
		]);
		renderPurchasedMaterials(normalizeApiList(purchasesResult), normalizeApiList(materialsResult));
	};

	const setInventoryStatus = function (message) {
		if (inventoryApiStatus) {
			inventoryApiStatus.textContent = message;
			inventoryApiStatus.hidden = !message;
		}
	};

	const appendInventoryRow = function (material, inventory) {
		const emptyRow = inventoryTableBody.querySelector('.inventory-empty-row');
		if (emptyRow) {
			emptyRow.remove();
		}

		const row = inventoryTableBody.insertRow();
		[
			getRecordValue(material, 'code_Name'),
			getRecordValue(material, 'item_Name'),
			getRecordValue(material, 'category'),
			getRecordValue(material, 'unit'),
			getRecordValue(inventory, 'buffer'),
			getRecordValue(inventory, 'balance'),
			getRecordValue(inventory, 'status')
		].forEach(function (value) {
			row.insertCell().textContent = String(value ?? '');
		});
	};

	const refreshInventoryTable = async function () {
		const [materialsResult, inventoryResult] = await Promise.allSettled([
			getLocalMaterials(),
			getLocalInventory()
		]);

		if (materialsResult.status === 'rejected') {
			throw materialsResult.reason;
		}

		const materials = normalizeApiList(materialsResult.value);
		const inventories = inventoryResult.status === 'fulfilled'
			? normalizeApiList(inventoryResult.value)
			: [];

		inventoryTableBody.replaceChildren();
		materials.forEach(function (material) {
			const materialId = getRecordValue(material, 'material_ID');
			const inventory = inventories.find(function (record) {
				return Number(getRecordValue(record, 'material_ID')) === Number(materialId);
			}) || {};
			appendInventoryRow(material, inventory);
		});

		if (materials.length === 0) {
			const row = inventoryTableBody.insertRow();
			row.className = 'inventory-empty-row';
			const cell = row.insertCell();
			cell.colSpan = 7;
			cell.textContent = 'No inventory materials added yet.';
		}

		setInventoryStatus(inventoryResult.status === 'rejected'
			? 'Materials loaded, but inventory values could not be retrieved from the API.'
			: '');
	};

	if (inventoryTableBody) {
		refreshInventoryTable().catch(function (error) {
			console.error('Inventory load failed:', error);
			setInventoryStatus('Could not load inventory materials from the API.');
		});
	}

	if (purchasedMaterialsTable) {
		refreshPurchasedMaterialsTable().catch(function (error) {
			console.error('Purchased materials load failed:', error);
			purchasedMaterialsTable.replaceChildren();
			const row = purchasedMaterialsTable.insertRow();
			const cell = row.insertCell();
			cell.colSpan = 8;
			cell.textContent = 'Could not load purchased materials from the API.';
		});
	}

	[purchasedMaterialsModal, purchasedMaterialsEditModal, inventoryAddModal, inventoryEditModal].forEach(function (modal) {
		if (modal && modal.parentElement !== document.body) {
			document.body.appendChild(modal);
		}
	});

	const closeModal = function () {
		if (purchasedMaterialsModal) {
			purchasedMaterialsModal.hidden = true;
		}
	};

	if (openPurchasedMaterialsModal && purchasedMaterialsModal) {
		openPurchasedMaterialsModal.addEventListener('click', async function () {
			addPurchasedMaterialForm.reset();
			setPurchasedMaterialError('');
			addPurchasedMaterialPicker.disabled = true;
			addPurchasedMaterialPicker.options.length = 1;
			purchasedMaterialsModal.hidden = false;
			try {
				const materials = normalizeApiList(await getLocalMaterials());
				materials.forEach(function (material) {
					const materialId = Number(getRecordValue(material, 'material_ID'));
					if (!Number.isInteger(materialId) || materialId <= 0) {
						return;
					}
					const option = document.createElement('option');
					option.value = String(materialId);
					option.textContent = `${String(getRecordValue(material, 'code_Name')).trim()} - ${String(getRecordValue(material, 'item_Name')).trim()}`;
					addPurchasedMaterialPicker.appendChild(option);
				});
				addPurchasedMaterialPicker.disabled = false;
			} catch (error) {
				setPurchasedMaterialError(`Could not load materials: ${error.message}`);
			}
		});
	}

	if (closePurchasedMaterialsModal && purchasedMaterialsModal) {
		closePurchasedMaterialsModal.addEventListener('click', closeModal);
	}

	if (purchasedMaterialsModal) {
		purchasedMaterialsModal.addEventListener('click', function (event) {
			if (event.target === purchasedMaterialsModal) {
				closeModal();
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && !purchasedMaterialsModal.hidden) {
				closeModal();
			}
		});
	}

	if (openPurchasedMaterialsEditModal && purchasedMaterialsEditModal) {
		openPurchasedMaterialsEditModal.addEventListener('click', async function () {
			purchasedMaterialsEditModal.hidden = false;
			purchaseMaterialPicker.disabled = true;
			purchaseMaterialPicker.options.length = 1;
			purchaseMaterialPicker.value = '';
			selectedPurchasedMaterialId = null;
			setPurchasedMaterialEditError('');
			if (purchasedMaterialEditRow) {
				Array.from(purchasedMaterialEditRow.querySelectorAll('input')).forEach(function (input) {
					input.value = '';
					input.disabled = true;
				});
			}
			if (savePurchasedMaterialChanges) {
				savePurchasedMaterialChanges.disabled = true;
			}

			try {
				const [purchasesResult, materialsResult] = await Promise.all([
					getLocalPurchaseMaterials(),
					getLocalMaterials()
				]);
				purchasedMaterialRecords = normalizeApiList(purchasesResult);
				purchasedMaterialEditMaterials = normalizeApiList(materialsResult);
				purchasedMaterialRecords.forEach(function (purchase) {
					const purchasedId = Number(getRecordValue(purchase, 'purchased_ID'));
					if (!Number.isInteger(purchasedId) || purchasedId <= 0) {
						return;
					}
					const material = purchasedMaterialEditMaterials.find(function (record) {
						return Number(getRecordValue(record, 'material_ID')) === Number(getRecordValue(purchase, 'material_ID'));
					}) || {};
					const option = document.createElement('option');
					option.value = String(purchasedId);
					option.textContent = `${String(getRecordValue(material, 'code_Name')).trim()} - ${String(getRecordValue(material, 'item_Name')).trim()} (SI ${getRecordValue(purchase, 'sI_No')})`;
					purchaseMaterialPicker.appendChild(option);
				});
				purchaseMaterialPicker.disabled = false;
			} catch (error) {
				setPurchasedMaterialEditError(`Could not load purchased materials: ${error.message}`);
			}
		});
	}

	if (addPurchasedMaterialForm) {
		addPurchasedMaterialForm.addEventListener('submit', async function (event) {
			event.preventDefault();
			setPurchasedMaterialError('');
			if (submitPurchasedMaterial) {
				submitPurchasedMaterial.disabled = true;
			}

			try {
				const formData = new FormData(addPurchasedMaterialForm);
				const materialId = Number(formData.get('material_ID'));
				const integerField = function (name, label) {
					const value = Number(formData.get(name));
					if (!Number.isInteger(value)) {
						throw new Error(`${label} must be a whole number.`);
					}
					return value;
				};
				const integerAmountField = function (name, label) {
					const value = Number(formData.get(name));
					if (!Number.isInteger(value) || value < 0) {
						throw new Error(`${label} must be a non-negative whole number.`);
					}
					return value;
				};

				if (!Number.isInteger(materialId) || materialId <= 0) {
					throw new Error('Select a valid material before saving.');
				}

				const payload = {
					date_Received_Item: formData.get('date_Received_Item'),
					sI_Date: formData.get('sI_Date'),
					sI_No: integerField('sI_No', 'SI No.'),
					supplier_Name: String(formData.get('supplier_Name') || '').trim(),
					remarks: String(formData.get('remarks') || '').trim(),
					quantity: integerField('quantity', 'Quantity'),
					unit_price: integerAmountField('unit_price', 'Unit Price'),
					amount: integerAmountField('amount', 'Amount'),
					material_ID: materialId
				};

				await addLocalPurchaseMaterial(payload);
				purchasedMaterialsModal.hidden = true;
				addPurchasedMaterialForm.reset();
				refreshPurchasedMaterialsTable().catch(function (error) {
					console.error('Purchased materials refresh failed:', error);
					purchasedMaterialsTable.replaceChildren();
					const row = purchasedMaterialsTable.insertRow();
					const cell = row.insertCell();
					cell.colSpan = 8;
					cell.textContent = 'Saved, but could not refresh purchased materials from the API.';
				});
			} catch (error) {
				console.error('Purchased material save failed:', error);
				setPurchasedMaterialError(error.message);
			} finally {
				if (submitPurchasedMaterial) {
					submitPurchasedMaterial.disabled = false;
				}
			}
		});
	}

	if (closePurchasedMaterialsEditModal && purchasedMaterialsEditModal) {
		closePurchasedMaterialsEditModal.addEventListener('click', function () {
			purchasedMaterialsEditModal.hidden = true;
		});
	}

	if (purchaseMaterialPicker && purchasedMaterialsTable && purchasedMaterialEditRow) {
		purchaseMaterialPicker.addEventListener('change', function () {
			selectedPurchasedMaterialId = purchaseMaterialPicker.value === ''
				? null
				: Number(purchaseMaterialPicker.value);
			const selectedPurchase = purchasedMaterialRecords.find(function (purchase) {
				return Number(getRecordValue(purchase, 'purchased_ID')) === selectedPurchasedMaterialId;
			}) || null;
			const material = selectedPurchase && purchasedMaterialEditMaterials.find(function (record) {
				return Number(getRecordValue(record, 'material_ID')) === Number(getRecordValue(selectedPurchase, 'material_ID'));
			}) || {};
			const values = selectedPurchase ? [
				getRecordValue(material, 'code_Name'),
				getRecordValue(material, 'item_Name'),
				getRecordValue(selectedPurchase, 'supplier_Name'),
				getRecordValue(selectedPurchase, 'sI_No'),
				getRecordValue(selectedPurchase, 'quantity'),
				getRecordValue(selectedPurchase, 'unit_price'),
				formatPurchaseDate(getRecordValue(selectedPurchase, 'sI_Date')),
				formatPurchaseDate(getRecordValue(selectedPurchase, 'date_Received_Item'))
			] : [];

			Array.from(purchasedMaterialEditRow.querySelectorAll('input')).forEach(function (input, index) {
				input.disabled = !selectedPurchase;
				input.value = String(values[index] ?? '').trim();
			});

			if (savePurchasedMaterialChanges) {
				savePurchasedMaterialChanges.disabled = !selectedPurchase;
			}
			setPurchasedMaterialEditError('');
		});
	}

	if (savePurchasedMaterialChanges && purchasedMaterialEditRow) {
		savePurchasedMaterialChanges.addEventListener('click', async function () {
			if (!selectedPurchasedMaterialId) {
				return;
			}
			savePurchasedMaterialChanges.disabled = true;
			setPurchasedMaterialEditError('');

			try {
				const [purchasesResult, materialsResult] = await Promise.all([
					getLocalPurchaseMaterials(),
					getLocalMaterials()
				]);
				const purchases = normalizeApiList(purchasesResult);
				const materials = normalizeApiList(materialsResult);
				const purchase = purchases.find(function (record) {
					return Number(getRecordValue(record, 'purchased_ID')) === selectedPurchasedMaterialId;
				});
				if (!purchase) {
					throw new Error(`Purchase material ID ${selectedPurchasedMaterialId} was not found by the API.`);
				}
				const materialId = Number(getRecordValue(purchase, 'material_ID'));
				const material = materials.find(function (record) {
					return Number(getRecordValue(record, 'material_ID')) === materialId;
				});
				if (!material) {
					throw new Error(`Linked material ID ${materialId} was not found by the API.`);
				}

				const inputs = Array.from(purchasedMaterialEditRow.querySelectorAll('input'));
				const integerField = function (input, label) {
					const value = Number(input.value);
					if (!Number.isInteger(value) || value < 0) {
						throw new Error(`${label} must be a non-negative whole number.`);
					}
					return value;
				};
				const updatedMaterial = {
					...material,
					code_Name: inputs[0].value.trim(),
					item_Name: inputs[1].value.trim()
				};
				const updatedPurchase = {
					...purchase,
					supplier_Name: inputs[2].value.trim(),
					sI_No: integerField(inputs[3], 'SI No.'),
					quantity: integerField(inputs[4], 'Quantity'),
					unit_price: integerField(inputs[5], 'Price'),
					sI_Date: inputs[6].value,
					date_Received_Item: inputs[7].value
				};

				const materialChanged = updatedMaterial.code_Name !== String(getRecordValue(material, 'code_Name')).trim() ||
					updatedMaterial.item_Name !== String(getRecordValue(material, 'item_Name')).trim();
				if (materialChanged) {
					await updateLocalMaterials(updatedMaterial);
				}
				await updateLocalPurchaseMaterial(updatedPurchase);
				await refreshPurchasedMaterialsTable();
				purchasedMaterialsEditModal.hidden = true;
			} catch (error) {
				console.error('Purchased material update failed:', error);
				setPurchasedMaterialEditError(error.message);
			} finally {
				savePurchasedMaterialChanges.disabled = !selectedPurchasedMaterialId;
			}
		});
	}

	if (purchasedMaterialsEditModal) {
		purchasedMaterialsEditModal.addEventListener('click', function (event) {
			if (event.target === purchasedMaterialsEditModal) {
				purchasedMaterialsEditModal.hidden = true;
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				purchasedMaterialsEditModal.hidden = true;
			}
		});
	}

	if (openInventoryAddModal && inventoryAddModal) {
		openInventoryAddModal.addEventListener('click', function () {
			if (addInventoryMaterialForm) {
				addInventoryMaterialForm.reset();
			}
			inventoryAddModal.hidden = false;
		});
	}

	if (closeInventoryAddModal && inventoryAddModal) {
		closeInventoryAddModal.addEventListener('click', function () {
			inventoryAddModal.hidden = true;
		});
	}

	if (inventoryAddModal) {
		inventoryAddModal.addEventListener('click', function (event) {
			if (event.target === inventoryAddModal) {
				inventoryAddModal.hidden = true;
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && !inventoryAddModal.hidden) {
				inventoryAddModal.hidden = true;
			}
		});
	}

	if (addInventoryMaterialForm && inventoryTableBody) {
		addInventoryMaterialForm.addEventListener('submit', async function (event) {
			event.preventDefault();
			const formData = new FormData(addInventoryMaterialForm);
			let materialCreated = false;
			if (inventoryAddError) {
				inventoryAddError.hidden = true;
				inventoryAddError.textContent = '';
			}
			if (submitInventoryMaterial) {
				submitInventoryMaterial.disabled = true;
			}

			try {
				const integerField = function (name) {
					const rawValue = String(formData.get(name) || '').trim();
					if (!rawValue) {
						return 0;
					}
					const value = Number(rawValue);
					if (!Number.isInteger(value)) {
						throw new Error(`${name} must be a whole number.`);
					}
					return value;
				};

				const materialPayload = {
					code_Name: String(formData.get('codeName') || '').trim(),
					item_Name: String(formData.get('itemName') || '').trim(),
					category: String(formData.get('category') || '').trim(),
					unit: String(formData.get('unit') || '').trim()
				};
				const inventoryPayload = {
					beginning_Balance: integerField('beginningBalance'),
					buffer: integerField('buffer'),
					purchased: integerField('purchased'),
					request: integerField('request'),
					returned: integerField('returned'),
					balance: integerField('balance'),
					available_Balance: integerField('availableBalance'),
					status: String(formData.get('status') || '').trim()
				};

				const createdMaterial = await addLocalMaterials(materialPayload);
				materialCreated = true;
				const materialId = Number(getRecordValue(createdMaterial, 'material_ID'));
				if (!Number.isInteger(materialId) || materialId <= 0) {
					throw new Error('The API saved the material but did not return a valid material_ID.');
				}

				inventoryPayload.material_ID = materialId;
				const createdInventory = await addLocalInventory(inventoryPayload);
				appendInventoryRow(createdMaterial, createdInventory || inventoryPayload);
				addInventoryMaterialForm.reset();
				inventoryAddModal.hidden = true;
				setInventoryStatus('');

				refreshInventoryTable().catch(function (error) {
					console.error('Inventory refresh failed:', error);
					setInventoryStatus('Saved successfully, but the table could not be refreshed from the API.');
				});
			} catch (error) {
				console.error('Inventory save failed:', error);
				if (inventoryAddError) {
					inventoryAddError.textContent = materialCreated
						? `Material was saved, but its inventory record failed: ${error.message}`
						: error.message;
					inventoryAddError.hidden = false;
				}
			} finally {
				if (submitInventoryMaterial) {
					submitInventoryMaterial.disabled = false;
				}
			}
		});
	}

	if (openInventoryEditModal && inventoryEditModal) {
		openInventoryEditModal.addEventListener('click', async function () {
			inventoryEditModal.hidden = false;
			inventoryMaterialPicker.options.length = 1;
			inventoryMaterialPicker.disabled = true;
			inventoryMaterialPicker.value = '';
			selectedMaterialId = null;
			if (inventoryEditError) {
				inventoryEditError.hidden = true;
				inventoryEditError.textContent = '';
			}
			Array.from(inventoryMaterialEditRow.querySelectorAll('input')).forEach(function (input) {
				input.value = '';
				input.disabled = true;
			});
			saveInventoryMaterialChanges.disabled = true;

			try {
				const [materialsResult, inventoryResult] = await Promise.all([
					getLocalMaterials(),
					getLocalInventory()
				]);
				inventoryMaterialRecords = normalizeApiList(materialsResult);
				inventoryRecords = normalizeApiList(inventoryResult);
				inventoryMaterialRecords.forEach(function (material) {
					const materialId = Number(getRecordValue(material, 'material_ID'));
					if (!Number.isInteger(materialId) || materialId <= 0) {
						return;
					}

					const option = document.createElement('option');
					option.value = String(materialId);
					option.textContent = `${String(getRecordValue(material, 'code_Name')).trim()} - ${String(getRecordValue(material, 'item_Name')).trim()}`;
					inventoryMaterialPicker.appendChild(option);
				});
				inventoryMaterialPicker.disabled = false;
			} catch (error) {
				if (inventoryEditError) {
					inventoryEditError.textContent = `Could not load materials for editing: ${error.message}`;
					inventoryEditError.hidden = false;
				}
			}
		});
	}

	if (closeInventoryEditModal && inventoryEditModal) {
		closeInventoryEditModal.addEventListener('click', function () {
			inventoryEditModal.hidden = true;
		});
	}

	if (inventoryEditModal) {
		inventoryEditModal.addEventListener('click', function (event) {
			if (event.target === inventoryEditModal) {
				inventoryEditModal.hidden = true;
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && !inventoryEditModal.hidden) {
				inventoryEditModal.hidden = true;
			}
		});
	}

	if (inventoryMaterialPicker && inventoryTableBody && inventoryMaterialEditRow) {
		inventoryMaterialPicker.addEventListener('change', function () {
			selectedMaterialId = inventoryMaterialPicker.value === ''
				? null
				: Number(inventoryMaterialPicker.value);
			const selectedMaterial = inventoryMaterialRecords.find(function (material) {
				return Number(getRecordValue(material, 'material_ID')) === selectedMaterialId;
			}) || null;
			const selectedInventory = inventoryRecords.find(function (inventory) {
				return Number(getRecordValue(inventory, 'material_ID')) === selectedMaterialId;
			}) || null;

			Array.from(inventoryMaterialEditRow.querySelectorAll('input')).forEach(function (input, index) {
				const values = selectedMaterial ? [
					getRecordValue(selectedMaterial, 'code_Name'),
					getRecordValue(selectedMaterial, 'item_Name'),
					getRecordValue(selectedMaterial, 'category'),
					getRecordValue(selectedMaterial, 'unit'),
					selectedInventory ? getRecordValue(selectedInventory, 'buffer') : '',
					selectedInventory ? getRecordValue(selectedInventory, 'balance') : '',
					selectedInventory ? getRecordValue(selectedInventory, 'status') : ''
				] : [];
				input.disabled = !selectedMaterial;
				input.value = String(values[index] ?? '').trim();
			});
			saveInventoryMaterialChanges.disabled = !selectedMaterial;
			if (inventoryEditError) {
				inventoryEditError.hidden = true;
				inventoryEditError.textContent = '';
			}
		});
	}

	if (saveInventoryMaterialChanges && inventoryMaterialEditRow && inventoryMaterialPicker) {
		saveInventoryMaterialChanges.addEventListener('click', async function () {
			if (!selectedMaterialId) {
				return;
			}
			saveInventoryMaterialChanges.disabled = true;
			if (inventoryEditError) {
				inventoryEditError.hidden = true;
				inventoryEditError.textContent = '';
			}

			try {
				const [materialsResult, inventoryResult] = await Promise.all([
					getLocalMaterials(),
					getLocalInventory()
				]);
				const materials = normalizeApiList(materialsResult);
				const inventories = normalizeApiList(inventoryResult);
				const material = materials.find(function (record) {
					return Number(getRecordValue(record, 'material_ID')) === selectedMaterialId;
				});
				if (!material) {
					throw new Error(`Material ID ${selectedMaterialId} was not found by the API.`);
				}

				const inputs = Array.from(inventoryMaterialEditRow.querySelectorAll('input'));
				const integerField = function (input, label) {
					const value = input.value.trim();
					if (!value) {
						return 0;
					}
					const number = Number(value);
					if (!Number.isInteger(number)) {
						throw new Error(`${label} must be a whole number.`);
					}
					return number;
				};

				const materialPayload = {
					...material,
					code_Name: inputs[0].value.trim(),
					item_Name: inputs[1].value.trim(),
					category: inputs[2].value.trim(),
					unit: inputs[3].value.trim()
				};
				const existingInventory = inventories.find(function (record) {
					return Number(getRecordValue(record, 'material_ID')) === selectedMaterialId;
				});

				await updateLocalMaterials(materialPayload);
				if (existingInventory) {
					await updateLocalInventory({
						...existingInventory,
						buffer: integerField(inputs[4], 'Buffer'),
						balance: integerField(inputs[5], 'Balance'),
						status: inputs[6].value.trim()
					});
				} else {
					await addLocalInventory({
						beginning_Balance: 0,
						buffer: integerField(inputs[4], 'Buffer'),
						purchased: 0,
						request: 0,
						returned: 0,
						balance: integerField(inputs[5], 'Balance'),
						available_Balance: 0,
						status: inputs[6].value.trim(),
						material_ID: selectedMaterialId
					});
				}

				inventoryEditModal.hidden = true;
				await refreshInventoryTable();
				setInventoryStatus('');
			} catch (error) {
				console.error('Inventory update failed:', error);
				if (inventoryEditError) {
					inventoryEditError.textContent = `Could not save the selected material: ${error.message}`;
					inventoryEditError.hidden = false;
				}
			} finally {
				saveInventoryMaterialChanges.disabled = !selectedMaterialId;
			}
		});
	}
}
