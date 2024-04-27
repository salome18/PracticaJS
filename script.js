const urlbyname= 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

async function consultarApi(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
      console.error(`Falló la consulta a la api: ${error}`);
    }
  }


async function verificarDatos(filterValue, foodName) {
    const normalizedFoodName = foodName.toLowerCase();
    const contError = document.querySelector(".error");
    let foundMatch = false; 

    
    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = '';
    const detailsContainer = document.getElementById("detailsContainer");
    detailsContainer.innerHTML = '';


    if (filterValue === "Name") {
        const dataByName = await consultarApi(urlbyname);
        const strFood = dataByName.meals;

        for (const plate of strFood) {
            const normalizedPlateName = plate.strMeal.toLowerCase();

            const foodWords = normalizedFoodName.split(" ");
            const plateWords = normalizedPlateName.split(" ");
            const commonWords = foodWords.filter(word => plateWords.includes(word));

            if (commonWords.length > 0) {
                const mealId = plate.idMeal;
                const mealDetails = await getMealDetailsById(mealId);

                if (mealDetails) {
                    showDetails(mealDetails);
                    foundMatch = true;
                    break; 
                }
            }
        }
    }
    else if (filterValue === "Main_ingredient") {
        const dataByIngredient = await consultarApi(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${normalizedFoodName}`);
        const mealsWithIngredient = dataByIngredient.meals;
    
        if (mealsWithIngredient) {
    
            mealsWithIngredient.forEach(async (meal) => {
                const mealId = meal.idMeal;

                const mealDetails = await getMealDetailsById(mealId);
    
                if (mealDetails) {                    
                    showSummary(mealDetails);
                }
            });
    
            foundMatch = true;
        }
    }
    else if (filterValue === "Category") {
        const dataByCategory = await consultarApi(urlbyname);
        const foodCategory = dataByCategory.meals;
    
        if (foodCategory) {
    
            for (const plate of foodCategory) {
                if (plate.strCategory.toLowerCase() === normalizedFoodName) {
                    const mealId = plate.idMeal;
    
                    const mealDetails = await getMealDetailsById(mealId);
    
                    if (mealDetails) {
                        showSummary(mealDetails);
                    }
                }
            }
    
            foundMatch = true;
        }
    }    
    else if (filterValue === "Nationality") {
        const dataByArea = await consultarApi(urlbyname);
        const foodArea = dataByArea.meals;
    
        if (foodArea) {
    
            for (const meal of foodArea) {
    
                if (normalizedFoodName === meal.strArea.toLowerCase()) {
                    const mealId = meal.idMeal;

                    const mealDetails = await getMealDetailsById(mealId);
    
                    if (mealDetails) {
                        showSummary(mealDetails);
                    }
                }
            }
    
            foundMatch = true;
        } 
    }

    if (foundMatch) {
        contError.style.display = "none"; 
    } else {
        contError.style.display = "flex"; 
    }
}

function getIngredientsList(mealDetails) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) { 
        const ingredient = mealDetails[`strIngredient${i}`];
        if (ingredient) {
            ingredients.push({ ingredient});
        } else {
            break;
        }
    }
    return ingredients;
}

async function getMealDetailsById(mealId) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();

        if (data && data.meals && data.meals.length > 0) {
            return data.meals[0];
        } else {
            return null; 
        }
    } catch (error) {
        return null; 
    }
}

function showSummary(mealDetails) {
    const mealName = mealDetails.strMeal;
    const mealThumb = mealDetails.strMealThumb;

    const mealSummary = document.createElement("div");
    mealSummary.classList.add("meal-summary");
    
    mealSummary.innerHTML = `
        <h3>${mealName}</h3>
        <img src="${mealThumb}" alt="${mealName}">
    `;
     
    const resultsContainer = document.getElementById("resultsContainer"); 
    resultsContainer.appendChild(mealSummary);

    mealSummary.addEventListener("click", async () => {
        const fullDetails = await getMealDetailsById(mealDetails.idMeal);
        resultsContainer.style.display = "none";
        showDetails(fullDetails);
    });
}


function showDetails(mealDetails) {
    const instructions = mealDetails.strInstructions;
    const mealThumb = mealDetails.strMealThumb;
    const tags = mealDetails.strTags;
    const mealName = mealDetails.strMeal;
    const ingredients = getIngredientsList(mealDetails);

    const resultsContainer = document.getElementById("detailsContainer");

    const mealDiv = document.createElement("div");
    mealDiv.classList.add("meal-item");

    mealDiv.innerHTML = `
        <h3>${mealName}</h3>
        <img src="${mealThumb}" alt="${mealName}">
        <p>Ingredients:</p>
        <ul>
        ${ingredients.map(ingredient => `<li>${ingredient.ingredient}</li>`).join("")}
        </ul>
        <p>Instructions: ${instructions}</p>
        <p>Tags: ${tags}</p>
    `;
    resultsContainer.appendChild(mealDiv);
}


const searchButton = document.querySelector(".button");

searchButton.addEventListener("click", () => {
    const filterSelect = document.querySelector(".filter select");
    const selectedOption = filterSelect.options[filterSelect.selectedIndex];
    const inputValue = selectedOption.value;

    const UserInput = document.querySelector(".Search input");
    const food= UserInput.value;

    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.style.display = "grid"; 

    verificarDatos(inputValue,food);
  });



