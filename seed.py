import requests
import json
import random



for i in range(100):
  x = requests.post(f"hfirebaseurl/macros.json",json={"calories":random.randint(500,1200),"carbs":random.randint(100,200),"fat":random.randint(100,200),"protein":random.randint(100,200),"sodium":random.randint(100,200),"sugar":random.randint(0,50)})
  print(x.text) 