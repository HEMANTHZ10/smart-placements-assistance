import asyncio,uuid
from database import company_insights_collection
from sentence_transformers import SentenceTransformer

# Loading a Sentence Transformer (Light-weight model for efficiency)
model = SentenceTransformer("all-MiniLM-L6-v2")

companies = [
    {
        "id":"c01",
        "companyName":"Google",
        "companyDesc":
            "Google is a global technology giant specializing in search, cloud computing, AI, and software engineering. Known for innovation and data-driven solutions, it offers cutting-edge products like Google Search, Android, and Google Cloud. With a strong focus on scalability, machine learning, and user-centric design, Google remains a top employer for tech professionals worldwide.",
        "roles":[
            {
                "role" : "Software Engineer",
                "jobDesc" : "Develop scalable applications and optimize system performance.",
                "package" : "30 LPA",
                "rounds": {
                    1 : "Technical & DSA test",
                    2 : "Aptitude & Reasoning test",
                    3 : "HR Interview"
                }
            },{
                "role" : "Data Scientist",
                "jobDesc" : "Analyze large datasets to derive insights and build ML models.",
                "package" : "35 LPA",
                "rounds":{
                    1 : "Technical & DSA Interview",
                    2 : "HR Interview"
                }
            }
        ],
        "description":"""
            During Google's annual campus selection visits, the company has consistently attracted top talent from universities across India, offering lucrative roles in Software Engineering and Data Science.
            The two primary roles offered during these selection drives were Software Engineer and Data Scientist. Software Engineers at Google work on developing scalable applications and optimizing system performance, undergoing a rigorous selection process comprising a Technical & DSA test, an Aptitude & Reasoning test, and a final HR interview, with a package of 30 LPA. Frequently asked questions for this role include:
                - Explain the time and space complexity of your approach to solving a given problem.
                - How would you optimize a large-scale distributed system?
                - Design a URL shortening service like Bit.ly.
                - Explain concepts of multithreading and concurrency in Java.
                - How does garbage collection work in Python?
            On the other hand, Data Scientists, responsible for analyzing large datasets, deriving insights, and building ML models, go through a Technical & DSA Interview followed by an HR interview, securing a 35 LPA package. Frequently asked questions for this role include:
                - Explain the difference between supervised and unsupervised learning.
                - How do you handle missing data in a dataset?
                - What are the key assumptions of linear regression?
                - How would you optimize a machine learning model for better accuracy?
                - Can you explain the bias-variance tradeoff?
            With its structured selection process and competitive compensation, Google has solidified its reputation as a dream employer for aspiring tech professionals, offering unparalleled career growth opportunities in cutting-edge fields.
            """
    }
]