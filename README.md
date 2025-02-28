# Search-UI-Tools

An extension to facilitate keyword audits in the Search UI.

## Features

- **Sort Price**: Sort products by price in ascending or descending order.
- **Highlight Ads**: Highlight advertisement products.
- **Back To Top**: Add a "Back to Top" button for easy navigation.
- **Inject Relevancy**: Inject relevancy ratings (Relevant, Less Relevant, Irrelevant) into products.
- **Inject Reason**: Inject reasons for relevancy ratings into products.
- **Inspect**: Inspect various metrics such as average price, promo products, sold products, rated products, average rating, Blibli provided products, official store products, relevancy products, and top reasons per swimlane.

## Installation

### Microsoft Edge

1. **Download the extension files**: Go to the repository and download the extension files to your computer by clicking on [this link](https://github.com/faarismuda/Search-UI-Tools/archive/refs/heads/main.zip).
2. **Unzip the downloaded file**: Locate the downloaded ZIP file on your computer (usually in the "Downloads" folder). Right-click on the file and select "Extract All..." to unzip the contents to a folder.
3. **Open Microsoft Edge**: Launch the Microsoft Edge browser on your computer.
4. **Navigate to the Extensions page**: In the address bar, type `edge://extensions/` and press Enter.
5. **Enable Developer mode**: In the bottom left corner of the Extensions page, you will see a toggle switch labeled "Developer mode". Click on it to enable Developer mode.
6. **Load the extension**: Click on the "Load unpacked" button. A file dialog will appear. Navigate to the folder where you unzipped the extension files and select it.
7. **Verify installation**: The extension should now be installed and active. You should see it listed on the Extensions page.

### Google Chrome

1. **Download the extension files**: Go to the repository and download the extension files to your computer by clicking on [this link](https://github.com/faarismuda/Search-UI-Tools/archive/refs/heads/main.zip).
2. **Unzip the downloaded file**: Locate the downloaded ZIP file on your computer (usually in the "Downloads" folder). Right-click on the file and select "Extract All..." to unzip the contents to a folder.
3. **Open Google Chrome**: Launch the Google Chrome browser on your computer.
4. **Navigate to the Extensions page**: In the address bar, type `chrome://extensions/` and press Enter.
5. **Enable Developer mode**: In the top right corner of the Extensions page, you will see a toggle switch labeled "Developer mode". Click on it to enable Developer mode.
6. **Load the extension**: Click on the "Load unpacked" button. A file dialog will appear. Navigate to the folder where you unzipped the extension files and select it.
7. **Verify installation**: The extension should now be installed and active. You should see it listed on the Extensions page.

## Notes

- The extension is designed to work specifically on the domain `searchcenter.gdn-app.com`. Some features will be disabled if the extension is used on other domains.
- Ensure that you have the necessary permissions enabled for the extension to function correctly.
- The extension uses Chrome's storage API to save the state of the "Highlight Ads" and "Back To Top" features.
- The extension has not been tested on macOS.
- The extension has not been tested on browsers other than Chromium-based browsers.

## Known Issues

- **Sort Price Functionality**: Occasionally, the sort price functionality does not work as expected. Sometimes, products are sorted into separate groups, resulting in category A being sorted and then category B being sorted, rather than a fully ordered list. The cause of this issue is currently unknown, and a solution has not yet been identified.

## Permissions

The extension requires the following permissions:

- `activeTab`: To interact with the currently active tab.
- `storage`: To save and retrieve settings.
- `contextMenus`: To add context menu items.
- `scripting`: To inject scripts into web pages.

## Is This Repository Safe?

Yes, this repository is safe to use. All source code is openly available in this repository, allowing you to inspect and review the code directly.

All code can be viewed directly in this repository.

## License

This project is licensed under the MIT License.