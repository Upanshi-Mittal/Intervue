import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(
    project="midyear-gist-481416-p5",
    location="us-central1"
)

model = GenerativeModel("gemini-1.5-flash")
response = model.generate_content("Say hello in one line")

print(response.text)
