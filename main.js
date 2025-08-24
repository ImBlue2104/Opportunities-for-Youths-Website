const form = document.getElementById('post-opportunity-form');
const titleInput = document.getElementById('opportunity-title');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('start-date');
const opportunityList = document.getElementById('opportunity-list');
const registeredOpportunityList = document.getElementById('registered-opportunity-list');

const postCategoryChoices = new Choices('#category', {
    removeItemButton: true,
    placeholderValue: 'Select categories',
    searchEnabled: false,
    shouldSort: false
});

const filterCategoryChoices = new Choices('#filter-category', {
    removeItemButton: true,
    placeholderValue: 'Filter categories',
    searchEnabled: false,
    shouldSort: true
});

const AllStorage = 'formDataArray';
const RegisteredStorage = 'registeredOpportunities';

function getAllOpportunities() {
    try {
        const storedData = localStorage.getItem(AllStorage);
        return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
        console.error('Error retrieving all opportunities from localStorage:', error);
        return [];
    }
}

function SaveAllOpportinites(data) {
    try {
        localStorage.setItem(AllStorage, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving all opportunities to localStorage:', error);
    }
}

function GetRegisteredOpportunites() {
    try {
        const storedData = localStorage.getItem(RegisteredStorage);
        return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
        console.error('Error retrieving registered opportunities from localStorage:', error);
        return [];
    }
}

function SaveRegisteredOpportunites(data) {
    try {
        localStorage.setItem(RegisteredStorage, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving registered opportunities to localStorage:', error);
    }
}

function renderOpportunityList(data, targetListElement, showRegisterButton = true) {
    targetListElement.innerHTML = '';
    if (data.length === 0) {
        targetListElement.innerHTML = '<p class="text-gray-500">No opportunities yet.</p>';
        return;
    }
    data.forEach((item, index) => {
        const itemElement = document.createElement('li');
        itemElement.dataset.index = index;
        itemElement.innerHTML = `
        <strong>${item.title}</strong><br>
        <small>${item.description}</small><br>
        <small>Date: ${item.date}</small><br>
        <small>Category: ${item.category}</small><br>
        ${showRegisterButton ? '<button type="button" class="register-btn">Register</button>' : ''}
      `;
        targetListElement.appendChild(itemElement);
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    const Catogories = postCategoryChoices.getValue(true).map(choice => choice).join(', ');
    const newItem = {
        title: titleInput.value,
        description: descriptionInput.value,
        date: dateInput.value,
        category: Catogories,
        id: Date.now()
    };
    const allOpportunities = getAllOpportunities();
    allOpportunities.push(newItem);
    SaveAllOpportinites(allOpportunities);

    applyFilter();
    renderRegisteredOpportunities();
    form.reset();
    postCategoryChoices.setChoiceByValue('');
}

function applyFilter() {
    const allOpportunities = getAllOpportunities();
    const FilterCategories = filterCategoryChoices.getValue(true).map(choice => choice);
    let filteredOpportunities = [];
    if (FilterCategories.includes('All') || FilterCategories.length === 0) {
        filteredOpportunities = allOpportunities;
    } else {
        filteredOpportunities = allOpportunities.filter(opportunity => {
            const opportunityCategories = opportunity.category.split(', ').map(cat => cat.trim());
            return FilterCategories.some(filterCat => opportunityCategories.includes(filterCat));
        });
    }
    renderOpportunityList(filteredOpportunities, opportunityList, true);
}

function renderRegisteredOpportunities() {
    const registeredOpportunities = GetRegisteredOpportunites();
    renderOpportunityList(registeredOpportunities, registeredOpportunityList, false);
}

function Register(event) {
    if (event.target.classList.contains('register-btn')) {
        const listItem = event.target.closest('li');
        if (listItem) {
            const title = listItem.querySelector('strong').textContent;
            const allOpportunities = getAllOpportunities();
            const registeredOpportunities = GetRegisteredOpportunites();
            const opportunityToRegister = allOpportunities.find(opp => opp.title === title);
            if (opportunityToRegister) {
                const alreadyRegistered = registeredOpportunities.some(regOpp => regOpp.id === opportunityToRegister.id);
                if (!alreadyRegistered) {
                    registeredOpportunities.push(opportunityToRegister);
                    SaveRegisteredOpportunites(registeredOpportunities);
                    renderRegisteredOpportunities();
                }
            }
        }
    }
}

window.onload = function() {
    form.addEventListener('submit', handleFormSubmit);
    applyFilter();
    renderRegisteredOpportunities();
    filterCategoryChoices.passedElement.element.addEventListener('change', applyFilter);
    opportunityList.addEventListener('click', Register);
};