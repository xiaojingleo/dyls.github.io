document.addEventListener('DOMContentLoaded', function () {  
    const searchInput = document.getElementById('search-input');  
    const searchButton = document.getElementById('search-button');  
    const suggestions = document.getElementById('suggestions');  
  
    // Simulate fetching suggestions from a server
    function fetchSuggestions(query) {
        return new Promise((resolve) => {
            // Mock data for suggestions (replace with actual fetch request)
            const movieSuggestions = [
                '阿凡达',
                '复仇者联盟',
                '星际穿越',
                '泰坦尼克号',
                '盗梦空间',
                '教父',
                '肖申克的救赎',
                '疯狂动物城',
                '机器人总动员',
                '寻梦环游记',
                // Add more movies as needed
            ];

            // Filter suggestions based on the query
            const filteredSuggestions = movieSuggestions.filter(movie =>
                movie.toLowerCase().includes(query.toLowerCase())
            );

            // Simulate network delay (optional)
            setTimeout(() => {
                resolve(filteredSuggestions);
            }, 300); // 300ms delay
        });
    }

    // Display suggestions based on the fetched data
    function displaySuggestions(suggestionsData) {
        suggestions.innerHTML = '';
        if (suggestionsData.length > 0) {
            suggestionsData.forEach(suggestion => {
                const div = document.createElement('div');
                div.textContent = suggestion;
                div.addEventListener('click', () => {
                    searchInput.value = suggestion;
                    performSearch();
                });
                suggestions.appendChild(div);
            });
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
    }

    // Perform search action
    function performSearch() {
        const query = searchInput.value;
        if (query) {
            alert(`Searching for: ${query}`);
            // Replace with actual search logic (e.g., sending a request to a server)
        }
    }

    // Event listener for input
    searchInput.addEventListener('input', async function () {
        const query = this.value;
        if (query.length >= 2) { // Only fetch suggestions if input length is 2 or more
            const suggestionsData = await fetchSuggestions(query);
            displaySuggestions(suggestionsData);
        } else {
            displaySuggestions([]); // Hide suggestions if input is too short
        }
    });  
  
    // Event listener for Enter key  
    searchInput.addEventListener('keydown', function (event) {  
        if (event.key === 'Enter') {  
            performSearch();  
        }  
    });  
  
    // Event listener for search button click  
    searchButton.addEventListener('click', function () {  
        performSearch();  
    });  
});