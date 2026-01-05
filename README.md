# PROXYCONTAIN

**Proxycontain** is a Firefox extension that integrates **Firefox Contextual Identities (Containers)** with per-container proxying and HTTP header manipulation. It is designed for **web application security testing and penetration testing workflows**.


[Install ProxyContain - Firefox](https://addons.mozilla.org/en-US/firefox/addon/proxycontain/)

---

## Key Capabilities

### Interaction Restrictions Bypass
- Restore text selection on websites that disable it
- Re-enable copy and paste functionality on restricted pages


### Container Management
- Create new Firefox containers
- Open tabs within a selected container
- Enumerate and manage existing containers

---

### Per-Container Proxy Configuration
- Assign an HTTP(S) proxy to a specific container
- Exclude specific domains from proxy routing using a bypass list

---

### Storage and Session Control
- Clear the following data for the active tab’s container:
  - Cookies
  - Session storage
  - Local storage
- Reload the tab while bypassing the browser cache

---

### Request Header Manipulation
- Add, modify, or replace HTTP headers on a per-container basis

---

### Burp Suite Integration
- Inject an `X-Fire` HTTP header containing:
  - Container name
  - Container color
- Enables visual identification and coloring of requests inside Burp Suite requires **Crypto Stripper** 

---

## Use Cases
- Parallel multi-session testing against the same target
- Authentication and authorization testing
- CSRF, session fixation, and privilege escalation testing
- Segregated proxy routing for different testing contexts
