from playwright.sync_api import sync_playwright, Error
import time
import json
import argparse
import os
from datetime import datetime

def setup_logging(log_dir):
    """Setup logging directory and return log file paths"""
    os.makedirs(log_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    event_log_path = os.path.join(log_dir, f"events_{timestamp}.log")
    
    return event_log_path

def log_event(log_file, event):
    """Log an event with timestamp to the specified file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(f"[{timestamp}] {event}\n")

def safe_evaluate(page, expression, default=None):
    """Safely evaluate JavaScript in the page context"""
    try:
        return page.evaluate(expression)
    except Error as e:
        print(f"Evaluation error: {e}")
        return default

def monitor_user_behavior(url, log_dir):
    # Setup logging
    event_log_path = setup_logging(log_dir)
    print(f"Logging events to: {event_log_path}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        
        # Flag to track if browser is closed
        is_closed = False
        
        def handle_close():
            nonlocal is_closed
            is_closed = True
            log_event(event_log_path, "Session ended")
            print("\nMonitoring stopped. Logs have been saved.")
        
        browser.on('disconnected', handle_close)
        
        # Navigate to starting page
        try:
            response = page.goto(url)
            if response:
                print(f"Page loaded with status: {response.status}")
            print(f"Navigated to: {url}")
            log_event(event_log_path, f"Session started - Navigated to: {url}")
            
            # Setup the monitoring after the page is loaded
            print("Setting up page monitors...")
            setup_page_monitors(page)
            
            # Verify monitor setup
            monitor_check = safe_evaluate(page, "!!window.monitorData")
            print(f"Monitor setup verified: {monitor_check}")
            
            # Try to inject the intention interface
            try:
                with open('intention-buttons.js', 'r') as f:
                    intention_interface_js = f.read()
                safe_evaluate(page, intention_interface_js)
            except FileNotFoundError:
                print("Warning: intention-buttons.js not found, skipping interface injection")
            
            print("Monitoring started. Close the browser window to stop monitoring.")
            log_event(event_log_path, "Monitoring initialized")
            
            # Set up navigation listener
            def handle_navigation(frame):
                if frame is page.main_frame:
                    print(f"Navigation detected to: {frame.url}")
                    log_event(event_log_path, f"Navigation - New URL: {frame.url}")
                    # Reinitialize monitors after navigation
                    setup_page_monitors(page)
            
            page.on("framenavigated", handle_navigation)
            
        except Exception as e:
            print(f"Error during initialization: {e}")
            log_event(event_log_path, f"Error during initialization: {e}")
            return
        
        # Monitor until browser is closed
        while not is_closed:
            try:
                if page.is_closed():
                    break
                
                # Verify monitorData exists
                if not safe_evaluate(page, "!!window.monitorData"):
                    print("Reinitializing monitors...")
                    setup_page_monitors(page)
                
                check_interactions(page, event_log_path)
                time.sleep(0.5)  # Reduced sleep time for more responsive monitoring
                
            except Exception as e:
                if is_closed:
                    break
                print(f"Error during monitoring: {e}")
                log_event(event_log_path, f"Error during monitoring: {e}")
                time.sleep(1)

def setup_page_monitors(page):
    script = """
        // Remove existing event listeners if any
        if (window.monitorData) {
            window.monitorData = null;
        }
        
        // Initialize fresh monitor data
        window.monitorData = {
            clickCount: 0,
            keypressCount: 0,
            scrollCount: 0,
            hoverCount: 0,
            lastInputValue: '',
            events: []
        };
        
        function logEvent(event) {
            if (window.monitorData) {
                window.monitorData.events.push(event);
                console.log('Monitored event:', event);
            }
        }
        
        // Click handler
        document.addEventListener('click', function(event) {
            if (!window.monitorData) return;
            window.monitorData.clickCount++;
            const target = event.target.closest('a');
            if (target && target.href) {
                logEvent(`Click detected on link: "${target.textContent.trim()}" (${target.href})`);
            } else {
                logEvent(`Click detected at: ${event.clientX}, ${event.clientY}`);
            }
        }, true);

        // Keypress handler
        document.addEventListener('keypress', function(event) {
            if (!window.monitorData) return;
            window.monitorData.keypressCount++;
            logEvent(`Key pressed: ${event.key}`);
        }, true);

        // Scroll handler
        let scrollTimeout;
        document.addEventListener('scroll', function() {
            if (!window.monitorData) return;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                window.monitorData.scrollCount++;
                logEvent(`Page scrolled to: ${window.scrollX}, ${window.scrollY}`);
            }, 100);
        }, true);

        // Input handler
        document.addEventListener('input', function(event) {
            if (!window.monitorData) return;
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                window.monitorData.lastInputValue = event.target.value;
                logEvent(`Input detected on ${event.target.tagName} element`);
            }
        }, true);

        // Hover handler
        let hoverTimeout;
        document.addEventListener('mousemove', function(event) {
            if (!window.monitorData) return;
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                window.monitorData.hoverCount++;
                const target = event.target.closest('a');
                if (target && target.href) {
                    logEvent(`Hover detected on link: "${target.textContent.trim()}" (${target.href})`);
                } else {
                    logEvent(`Hover detected at: ${event.clientX}, ${event.clientY}`);
                }
            }, 500);
        }, true);

        console.log('Page monitors initialized');
    """
    result = safe_evaluate(page, script)
    print("Monitor setup completed")
    return result

def check_interactions(page, event_log_path):
    monitor_data = safe_evaluate(page, "window.monitorData")
    if not monitor_data:
        return
    
    if monitor_data['clickCount'] > 0:
        msg = f"Detected {monitor_data['clickCount']} click(s)"
        print(msg)
        log_event(event_log_path, msg)
        safe_evaluate(page, "window.monitorData.clickCount = 0")
    
    if monitor_data['keypressCount'] > 0:
        msg = f"Detected {monitor_data['keypressCount']} keypress(es)"
        print(msg)
        log_event(event_log_path, msg)
        safe_evaluate(page, "window.monitorData.keypressCount = 0")
    
    if monitor_data['scrollCount'] > 0:
        msg = f"Detected {monitor_data['scrollCount']} scroll(s)"
        print(msg)
        log_event(event_log_path, msg)
        safe_evaluate(page, "window.monitorData.scrollCount = 0")
    
    if monitor_data['hoverCount'] > 0:
        msg = f"Detected {monitor_data['hoverCount']} hover(s)"
        print(msg)
        log_event(event_log_path, msg)
        safe_evaluate(page, "window.monitorData.hoverCount = 0")
    
    if monitor_data['lastInputValue']:
        msg = f"Last input value: {monitor_data['lastInputValue']}"
        print(msg)
        log_event(event_log_path, msg)
        safe_evaluate(page, "window.monitorData.lastInputValue = ''")
    
    # Log and clear events
    if monitor_data['events'] and len(monitor_data['events']) > 0:
        for event in monitor_data['events']:
            print(event)
            log_event(event_log_path, event)
        safe_evaluate(page, "window.monitorData.events = []")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Monitor user behavior on a specified website')
    parser.add_argument('url', help='URL to monitor (e.g., https://www.example.com)')
    parser.add_argument('log_dir', help='Directory to save log files')
    
    args = parser.parse_args()
    
    print(f"Starting monitoring of {args.url}")
    print(f"Logs will be saved to: {args.log_dir}")
    print("Close the browser window to stop monitoring")
    
    monitor_user_behavior(args.url, args.log_dir)