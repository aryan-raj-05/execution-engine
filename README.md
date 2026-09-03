# Execution Engine

A secure and scalable backend service that enables users to submit source code, execute it in isolated environments, and receive execution results such as output, errors, and resource usage.

---

### Execution Flow

```mermaid
sequenceDiagram
    participant Browser
    participant API
    participant Queue as BullMQ Queue
    participant Worker
    participant DB as Database

    Browser->>API: POST /submit
    API->>DB: Save submission (QUEUED)
    API->>Queue: Enqueue job
    API-->>Browser: { submissionId, status: "QUEUED" }

    Queue->>Worker: Deliver job
    Worker->>Worker: Compile & run code
    Worker->>DB: Update status = ACCEPTED

    alt Polling
        loop Every second
            Browser->>API: GET /submission/123
            API->>DB: Read status
            API-->>Browser: ACCEPTED
        end
    end
```
