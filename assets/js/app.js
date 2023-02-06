// Define variables for UI using ID
const searchInput = document.getElementById("search-input")
const searchBtn  = document.getElementById("search-button")

// Define variables for weather results
const todayLocationName = document.getElementById("today-location-name")
const todayTemp = document.getElementById("today-temp")
const todayWind = document.getElementById("today-wind")
const todayHumidity = document.getElementById("today-humidity")

// Define variables for search history that will be appended
const forecastContainer = document.getElementById("forecast")
const historyContainer = document.getElementById("history")
const historyList = JSON.parse(localStorage.getItem("locations") || '[]') 

const handleSearch=async(place)=>{
    
    // Set conditional to handle Search Button click by user without any input in placeholder
    if(place?.length<= 0){
        alert("Please enter city name before searching!")
        return
    }

    // Set Variable to Request for search place API
    const placeSearchResult =await handleGetLongLat(place)

    // Validate if place was found
    if(placeSearchResult == undefined){
        alert("Corresponding place search was not found")
        return
    }

    // Set Variable for forecast result based on longitude and latitude
    const result = await handleGetForecast(placeSearchResult.lon, placeSearchResult.lat)

    // Conditional to alert user if forecast is unavailable for a given loaction
    if(result == undefined){
        alert("No forecast available for City entered")
        return
    }


    // Getting present and future forecasts for a city
    const {forecastResult,todayForecastResult} = result

    // Variable to display 5-day forecast starting at 6:00:00 each day. 
    // There was an option to create a For Loop to get this data but seemed quite simple :)
    const fiveDaysForecast= [forecastResult?.list?.[2], forecastResult?.list?.[10], forecastResult?.list?.[18], forecastResult?.list?.[26], forecastResult?.list?.[34]]

    renderHtml(todayForecastResult, fiveDaysForecast)


}

// Setting up API link to get weather report for a given city entered by user
const handleGetLongLat=async(place)=>{
    const request = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${place}&limit=20&appid=4a6540b6c5fcfc38ab3cc789481f4a55`)
    if(request.ok){
        const searchData= await request.json()
    // Returning the most accurate search match from API
       return searchData?.[0]
    }

     // Return undefined to signal error or no search found
    return undefined
}

// Setting up API for coordinates
const handleGetForecast=async(long, lat)=>{
    // Request to get todays forecast
    const todayRequest = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=4a6540b6c5fcfc38ab3cc789481f4a55&units=metric`)
    // Request to weather forecast api
    const request = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=4a6540b6c5fcfc38ab3cc789481f4a55&units=metric`)
    
    if(request.ok && todayRequest.ok){
        const forecastResult =  await request.json()
        const todayForecastResult = await todayRequest.json()

        if(!historyList.includes(todayForecastResult.name?.toLowerCase())){

            historyList.push(todayForecastResult.name?.toLowerCase())
            console.log("renderHistory:",historyList);
            localStorage.setItem("locations",JSON.stringify (historyList))
            renderHistory()
        }

        return {forecastResult, todayForecastResult}
    }

    return undefined
}


