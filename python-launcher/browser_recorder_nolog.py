from playwright.sync_api import sync_playwright
import time
import json

def monitor_user_behavior():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        
        page = context.new_page()
        setup_page_monitors(page)
        
        # Inject the intention interface
        with open('intention-buttons.js', 'r') as f:
            intention_interface_js = f.read()
        
        # Setup intention event listener
        page.evaluate("""
            document.addEventListener('userIntention', (event) => {
                const intentionData = event.detail;
                console.log('User Intention:', JSON.stringify(intentionData));
                window.monitorData.events.push(`User indicated: ${intentionData.type} at ${intentionData.timestamp}`);
            });
        """)
        
        # Navigate to starting page and inject interface
        page.goto("https://www.amazon.com")
        page.evaluate(intention_interface_js)
        print(f"Navigated to: {page.url}")
        
        # Set up navigation listener and inject interface after each navigation
        def handle_navigation(frame):
            print(f"Navigated to: {frame.url}")
            frame.evaluate(intention_interface_js)
        
        page.on("framenavigated", handle_navigation)
        
        # Monitor for 5 minutes
        start_time = time.time()
        while time.time() - start_time < 300:  # 5 minutes
            time.sleep(1)
            try:
                check_interactions(page)
            except Exception as e:
                print(f"Error checking interactions: {e}")
                setup_page_monitors(page)
                page.evaluate(intention_interface_js)  # Reinject interface if needed
        
        browser.close()

def setup_page_monitors(page):
    page.evaluate("""
        window.monitorData = {
            clickCount: 0,
            keypressCount: 0,
            scrollCount: 0,
            hoverCount: 0,
            lastInputValue: '',
            events: []
        };
        
        function logEvent(event) {
            window.monitorData.events.push(event);
            console.log(event);  // This will appear in the browser console and Playwright logs
        }
        
        // Click handler
        window.addEventListener('click', (event) => {
            window.monitorData.clickCount++;
            const target = event.target.closest('a');
            if (target && target.href) {
                logEvent(`Click detected on link: "${target.textContent.trim()}" (${target.href})`);
            } else {
                logEvent(`Click detected at: ${event.clientX}, ${event.clientY}`);
            }
        }, true);  // Use capture phase to ensure this runs before navigation

        // Keypress handler
        window.addEventListener('keypress', (event) => {
            window.monitorData.keypressCount++;
            logEvent(`Key pressed: ${event.key}`);
        });

        // Scroll handler
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                window.monitorData.scrollCount++;
                logEvent(`Page scrolled to: ${window.scrollX}, ${window.scrollY}`);
            }, 100);
        });

        // Input handler
        window.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                window.monitorData.lastInputValue = event.target.value;
                logEvent(`Input detected on ${event.target.tagName} element`);
            }
        });

        // Hover handler
        let hoverTimeout;
        window.addEventListener('mousemove', (event) => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                window.monitorData.hoverCount++;
                const target = event.target.closest('a');
                if (target && target.href) {
                    logEvent(`Hover detected on link: "${target.textContent.trim()}" (${target.href})`);
                } else {
                    logEvent(`Hover detected at: ${event.clientX}, ${event.clientY}`);
                }
            }, 500);  // 500ms delay to consider it a hover
        });
    """)

def check_interactions(page):
    try:
        monitor_data = page.evaluate("window.monitorData")
        if monitor_data is None:
            print("Warning: monitorData is None. Reinitializing...")
            setup_page_monitors(page)
            return
        
        if monitor_data['clickCount'] > 0:
            print(f"Detected {monitor_data['clickCount']} click(s)")
            page.evaluate("window.monitorData.clickCount = 0")
        
        if monitor_data['keypressCount'] > 0:
            print(f"Detected {monitor_data['keypressCount']} keypress(es)")
            page.evaluate("window.monitorData.keypressCount = 0")
        
        if monitor_data['scrollCount'] > 0:
            print(f"Detected {monitor_data['scrollCount']} scroll(s)")
            page.evaluate("window.monitorData.scrollCount = 0")
        
        if monitor_data['hoverCount'] > 0:
            print(f"Detected {monitor_data['hoverCount']} hover(s)")
            page.evaluate("window.monitorData.hoverCount = 0")
        
        if monitor_data['lastInputValue']:
            print(f"Last input value: {monitor_data['lastInputValue']}")
            page.evaluate("window.monitorData.lastInputValue = ''")
        
        # Print and clear events
        for event in monitor_data['events']:
            print(event)
        page.evaluate("window.monitorData.events = []")
        
    except Exception as e:
        print(f"Error in check_interactions: {e}")

if __name__ == "__main__":
    monitor_user_behavior()