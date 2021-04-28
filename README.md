![KnugBot Logo](https://github.com/ucfcs/ucf-ai-advising-chatbot/blob/main/knugbot_logo.png)

# Overview

* **Year:** 2021
* **Sponsor:** Dr. Mark Heinrich, CS/IT Undergraduate Coordinator
* **Group:** Group #29

# Team

* Maya Awad
* Owen Brahms
* Reagan Chapman
* Raj Patel
* Carlos Santiago Bañón (Project Manager)

# Description

The *Knugget Advising Chatbot* (or *KnugBot*) for the Department of Computer Science and Information Technology at the University of Central Florida empowers advisors to allocate their time more efficiently by reducing their load of frequently asked questions while providing accurate answers and reducing response times for student inquiries. Students can use it as their first stop for advising questions, and advisors can easily add, edit, or remove questions and responses as needed. Using state-of-the-art artificial intelligence techniques, the chatbot creates a custom advising experience for the university, providing high value at no cost. Designed with extensibility in mind, the system has the potential to be used by other departments in the future.

The project is divided into the following main subsystems:

* AI System
* Student System
* Faculty System
* Database System

# Accessing the Chatbot and Faculty Systems

To access the systems, you need to be behind the UCF firewall. To do this, you need to either be logged in to UCF's wi-fi network on campus, or use the UCF VPN. You can find instructions about how to log in remotely through the VPN [here](https://ucf.service-now.com/ucfit?id=kb_article&sys_id=ff89f4764f45e200be64f0318110c763).

Once you are behind the firewall, simply log in to each system with the following IP addresses:

* **Chatbot:** 10.171.204.196
* **Faculty System:** 10.171.204.196/faculty/

# Tools Used

## Web Applications
* Python, Flask (Backend)
* React (Frontend)
* MongoDB (Database)
* Apache (Server)
* Postman (Testing)

## AI
* Python
* PyTorch, Scikit-Learn, NLTK, NumPy, Pandas, etc.

# Future Work

Some features that were not implemented due to our time constraints could be implemented in the future. These include:

* Display of follow-up questions and contacts in the chatbot.
* Speech-to-text recognition in all browsers.
* Statistics page in the Faculty System to display usage metrics. These are all recorded but are not displayed thus far. (*Detailed instructions about how to access them via a Terminal will be provided.*)
