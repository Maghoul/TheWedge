The Wedge
A personal web app for aviation enthusiasts, providing tools like weather data for flight planning and a planned aircraft weight and balance calculator.
Features

Weather Data: Fetch METAR and TAF data for airports using the AVWX API. Enter departure and arrival airport codes (e.g., KMEM, KIND) to see current and forecasted weather conditions, including flight rules (VFR, IFR, etc.).
Planned Features: Aircraft weight and balance calculator to help pilots compute total weight, center of gravity, and ensure safe flight parameters.

Prerequisites

A modern web browser (e.g., Chrome, Firefox, Edge).
An AVWX API token for weather data (sign up at avwx.rest to get one).
VS Code with the Live Server extension (or another local server) to run the app locally.

Installation

Clone the repository from GitHub:git clone https://github.com/Maghoul/TheWedge.git

(Replace your-username with your actual GitHub username.)
Open the project in VS Code:
Open VS Code, go to File > Open Folder, and select the cloned repository folder.


Install the Live Server extension in VS Code (if not already installed):
Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X on Mac), search for "Live Server," and click Install.


Start the local server:
Open index.html in VS Code, right-click, and select "Open with Live Server," or click the "Go Live" button in the bottom-right corner.



Usage

Open the app in your browser via Live Server (it will typically open at http://127.0.0.1:5500).
If prompted, enter your AVWX API token to enable weather data fetching.
The token is saved in your browser’s localStorage for future use.


Navigate to the Weather page (wx.html):
Enter a departure airport code (required) and an arrival airport code (optional) in ICAO format (e.g., KMEM for Memphis International).
Optionally, provide Estimated Time of Departure (ETD) and Estimated Time of Arrival (ETA) in HH:mm format (e.g., 14:30) to see forecasted conditions.
Submit the form to view METAR and TAF data, including flight rules color-coded (e.g., green for VFR, red for LIFR).


Check back later for the weight and balance calculator once it’s implemented!

Project Structure

index.html: The main landing page for The Wedge.
wx.html: The weather data page where users can fetch METAR and TAF reports.
wx.js: JavaScript logic for the weather feature, handling API requests, form validation, and data display.
navbar.js: Shared JavaScript for the navigation bar across pages.
styles.css (assumed): CSS styles for the app’s layout and design.

Notes

This is a personal project built as part of my learning journey in web development.
The app runs entirely in the browser—no backend server is required.
The weather feature uses the AVWX API, which requires a free API token. If the token becomes invalid, the app will prompt you to enter a new one.
The weight and balance calculator is a planned feature and not yet implemented as of June 2025.

Development Setup

Environment: Developed on a Surface Laptop 3 using VS Code.
Version Control: Hosted on GitHub for tracking changes and sharing.
Testing: Tested locally using VS Code’s Live Server extension.

Contributing
This is a personal project, but I’m open to feedback! If you have suggestions or find bugs, feel free to open an issue on GitHub.
Contact

GitHub: [Your GitHub username] (Replace with your actual username.)
Email: [Your email, if you want to share it.]

Acknowledgments

Thanks to the AVWX API for providing weather data for aviation.
Inspired by my interest in aviation and learning to code through freeCodeCamp and other resources.

