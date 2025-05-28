# Search UI Tools

<p align="center">
    <img src="images/icon350.png" width="200" alt="Search UI Tools"/>
<p>
<p align="center">
    An extension to facilitate keyword audits in the Search UI.
<p>

## Features

- **Sort Price**: Sort products by price in ascending or descending order.
- **Highlight Ads**: Highlight advertisement products.
- **Back To Top**: Add a "Back to Top" button for easy navigation.
- **Inject Relevancy**: Inject relevancy ratings (Relevant, Less Relevant, Irrelevant) into products.
- **Inject Reason**: Inject reasons for relevancy ratings into products.
- **Inspect**: Inspect various metrics such as average price, promo products, sold products, rated products, average rating, Blibli provided products, official store products, relevancy products, top reasons per swimlane, and top locations per swimlane.
- **Submitted Mark**: Mark swimlanes as submitted once the audit is completed.
- **Download Products**: Export product data to Excel file (Blibli.com only).
- **Copy Categories**: Copy selected categories to clipboard for easy reference (Blibli.com only).

## Installation

1. **Download the extension files**: 
   - Go to the repository and download the extension files by clicking on [this link](https://github.com/faarismuda/Search-UI-Tools/archive/refs/heads/main.zip)
   - Locate the downloaded ZIP file (usually in "Downloads" folder)
   - Right-click and select "Extract All..." to unzip the contents

2. **Open your browser**: 
   - For Microsoft Edge: Launch Edge and type `edge://extensions/` in the address bar
   - For Google Chrome: Launch Chrome and type `chrome://extensions/` in the address bar

3. **Enable Developer mode**:
   - In Edge: Toggle switch in bottom left corner
   - In Chrome: Toggle switch in top right corner

4. **Load the extension**:
   - Click "Load unpacked" button
   - Navigate to your extracted folder
   - Select the folder and click OK

5. **Verify installation**:
   - The extension should now appear in your list of extensions
   - Make sure it's enabled (toggle switch should be on)

## Updating Extension

To update the extension to the latest version:

1. **Download new version**: 
   - Click [this link](https://github.com/faarismuda/Search-UI-Tools/archive/refs/heads/main.zip) to download the latest version
   - Extract the ZIP file to a new folder

2. **Find extension folder**: 
   - Go to Extensions page (`edge://extensions/` for Edge or `chrome://extensions/` for Chrome)
   - Find Search UI Tools in your list of extensions
   - Click "Details" on the extension
   - Look for "Source" or "Extension Location" and click "Show in folder"

3. **Update files**: 
   - Delete all files in the extension folder
   - Copy all files from the new version folder you extracted
   - Paste them into the extension folder

4. **Refresh extension**: 
   - Go back to the Extensions page
   - Find Search UI Tools
   - Click the refresh icon (🔄) or reload button on the extension card

That's it! Your extension should now be updated to the latest version.

## Notes

- The extension is designed to work specifically on the domain `searchcenter.gdn-app.com`. Some features will be disabled if the extension is used on other domains.
- Ensure that you have the necessary permissions enabled for the extension to function correctly.
- The extension uses Chrome's storage API to save the state of the "Highlight Ads" and "Back To Top" features.
- The extension has not been tested on macOS.
- The extension has not been tested on browsers other than Chromium-based browsers.
- This extension is not intended to speed up the audit process, but rather to make it more accurate.

## Known Issues

- ~~**Sort Price Functionality**: Occasionally, the sort price functionality does not work as expected. Sometimes, products are sorted into separate groups, resulting in category A being sorted and then category B being sorted, rather than a fully ordered list. The cause of this issue is currently unknown, and a solution has not yet been identified.~~ FIXED 13/03/25 :D

## Permissions

The extension requires the following permissions:

- `activeTab`: To interact with the currently active tab.
- `storage`: To save and retrieve settings.
- `contextMenus`: To add context menu items.
- `scripting`: To inject scripts into web pages.

## Is This Repository Safe?

Yes, this repository is safe to use. All source code is openly available in this repository, allowing you to inspect and review the code directly.

## License

This project is licensed under the MIT License.