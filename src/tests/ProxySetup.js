const {remote} = require('webdriverio');
const assert = require("node:assert");

const nativeCapabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    //'appium:deviceName': 'process.env.DEVICEFARM_DEVICE_NAME',
};

const chromeCapabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    //'appium:deviceName': 'process.env.DEVICEFARM_DEVICE_NAME',
    'browserName': 'Chrome',
};

const nativeWdOpts = {
    runner: 'local',
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
    path: '/wd/hub',
    logLevel: 'info',
    capabilities: nativeCapabilities,
};

const chromeWdOpts = {
    runner: 'local',
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
    path: '/wd/hub',
    logLevel: 'info',
    capabilities: chromeCapabilities,
};

const TIMEOUT = 180000;

let driver;
let previousIpAddress;

before(async function() {
    this.timeout(TIMEOUT)
    console.log("Running beforeTest function...");
    previousIpAddress = await getIpAddress();
    driver = await remote(nativeWdOpts);
    await setupProxy();
});

const getIpAddress = async () => {
    console.log("Getting IP address...");
    driver = await remote(chromeWdOpts);
    await driver.url('https://api.ipify.org?format=json');
    const bodyContent = await driver.$('body').getText();
    console.log(bodyContent);
    return bodyContent;
}

const setupProxy = async () => {
    console.log("Setting up proxy...");
    await driver.startActivity('moe.nb4a', 'io.nekohasekai.sagernet.ui.MainActivity');
    driver.pause(5000);
    const yesButton = await driver.$('//*[@text="YES"]');
    if (await yesButton.isDisplayed()) {
        console.log("'YES' button displayed & clicked");
        await yesButton.click();
    }
    await swipeRight();
    let toolsButton = await driver.$('//*[@text="Tools"]');
    if(!(await toolsButton.isDisplayed())) {
        await swipeRight();
        toolsButton = await driver.$('//*[@text="Tools"]');
    }
    await toolsButton.click();
    await driver.$('//*[@text="GENERATE CONFIGURATION"]').click();
    await driver.pause(5000);
    let configurationButton = await driver.$('//*[@text="WireGuard"]');
    while (!(await configurationButton.isDisplayed())) {
        await driver.pause(1000);
        configurationButton = await driver.$('//*[@text="WireGuard"]');
    }
    await configurationButton.click();
    await driver.$('//*[@content-desc="Connect"]').click();
    const okButton = await driver.$('//*[@text="OK"]');
    if (await okButton.isDisplayed()) {
        await okButton.click();
    }
}

const swipeRight = async () => {
    await driver.pause(1000);
    await driver.execute("mobile: swipeGesture", {
        left: 50, top: 400, width: 800, height: 100, direction: 'right', percent: 0.75
    });
    await driver.pause(1000);
}

after(async function() {
    this.timeout(TIMEOUT)
    console.log("Running afterTest function...");
    await driver.deleteSession();
    // Add any cleanup code here
});

describe('Test Suite', function() {
    it('check IP address', async function() {
        this.timeout(TIMEOUT)
        const currentIpAddress = await getIpAddress();
        console.log("Previous IP address: " + previousIpAddress);
        console.log("Current IP address: " + currentIpAddress);
        assert(previousIpAddress !== currentIpAddress, "IP address did not change!")
    });
});
