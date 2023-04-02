import requests
import json
import datetime
import random




def find_barcode(barcode):
  if barcode == "079997000638":
    return "2% Milk, 1 Gallon"
  x = requests.get(f'https://api.upcitemdb.com/prod/trial/lookup?upc={barcode}')
  if(x.status_code != 200):
    return None
  j = json.loads(x.text)
  if len(j["items"]) == 0:
    return None
  return j["items"][0]["title"]

# print(find_barcode("5449000000996"))

# # x = requests.put(f"hfirebaseurl/items/{'water'}.json",json={'expiry':'later'})
# # x = requests.delete(f"hfirebaseurl/items/{'water'}.json")
# # print(x.text)

# food = ["orange","beef","milk","chicken","apple"]
# now = datetime.datetime.now()

# for f in food:
#   expiry = now + datetime.timedelta(days=random.randint(-2,2))
#   x = requests.put(f"hfirebaseurl/items/{random.randint(10000,99999)}.json",json={"name":f,"expiry":expiry.strftime("%m/%d/%Y"),"purchase_date":datetime.datetime.now().strftime("%m/%d/%Y")})

def avg_expiry(data):
    # [[item, expiry], [item2, expiry2]]
    itemsExpiry = {}
    itemsAvgExpiry = {}
    a_o_d = data.values() #array of dicks
    for items in a_o_d:
        itemName = items['name']
        itemExpiry = items['expiry_time']
        if itemName in itemsExpiry.keys():
            itemsExpiry[itemName][0] += itemExpiry #total expiry date
            itemsExpiry[itemName][1] += 1 #total number
        else:
          itemsExpiry.update({itemName: [itemExpiry, 1]})
    
    for k in itemsExpiry.keys():
        itemsAvgExpiry.update({k: itemsExpiry[k][0]/itemsExpiry[k][1]})


    return itemsAvgExpiry

# x = requests.get(f'hfirebaseurl/expiry.json')
# a = avg_expiry(json.loads(x.text))
# print(a)
# print(x.text)