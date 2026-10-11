# Security Policy

## Reporting a vulnerability

Report privately through GitHub: open the **Security** tab on this repository and use **Report a vulnerability**. Please do not open a public issue for a security problem.

You should get an acknowledgement within 7 days. If the report is accepted, the fix ships in a new release and the advisory is published with credit to you unless you ask otherwise. If it is declined, you get the reasoning and are free to disclose.

## Scope

In scope: the example agent and its committed cassettes

Out of scope: the `docs-site/` directory and anything under `examples/`, which are not published and are not part of the supported surface. Denial of service through deliberately malformed input to a local developer tool is also out of scope unless it escalates beyond the calling process.

## Supported versions

This repository is not published to npm. It is a reference implementation, read and cloned rather than installed as a dependency. Fixes land on `main` and there are no release branches.
