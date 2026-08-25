# College Library App

## Overview
A comprehensive digital library management system designed for college students and staff to access academic resources, manage borrowed materials, and discover new publications.

## Features
- **Book Catalog**: Search and browse thousands of academic titles
- **Borrowing System**: Check out and renew materials easily
- **Account Management**: Track your loans and due dates
- **Notifications**: Receive alerts for due dates and new arrivals

## Getting Started
1. Create an account with your college credentials
2. Search for materials by title, author, or subject
3. Place holds or check out items directly
4. Access your library dashboard anytime

## Support
Contact the library help desk for assistance or technical issues.

##Testing models

example registration

{
  "enrollmentId": "2026-0001",
  "name": "Admin",
  "lastname": "Ureña",
  "email": "admin@liceolaurena.edu.do",
  "password": "password123",
  "role": "admin"
}

example Sign In´
{
    "enrollmentId": "2026-0001",
    "password": "password123"
}

example Book register

{
  "title": "Cien años de soledad",
  "author": "Gabriel García Márquez",
  "isbn": "978-0307474728",
  "category": "Literatura",
  "stockTotal": 5,
  "stockAvailable": 5
}
