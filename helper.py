import json
import requests
def most_frequent(List):
    counter = 0
    num = List[0]
     
    for i in List:
        curr_frequency = List.count(i)
        if(curr_frequency> counter):
            counter = curr_frequency
            num = i
 
    return num

def avg_points(p):
    x = sum([i[0] for i in p])/4
    y = sum([i[1] for i in p])/4
    return[x,y]

# def avg_expiry(dictionary):
#     # [[item, expiry], [item2, expiry2]]
#     itemsExpiry = {}
#     itemsAvgExpiry = {}
#     for i in dictionary.keys(): #i is random code tionary[i][item] #total expiry date
#                     itemsExpiry[item][1] += 1 #total number
#                 else:
#                     itemsExpiry.add(item, [dictionary[i][item], 1]) #creates new item
#     for k in itemsExpiry.keys():
#         itemsExpiry.add(k, itemsExpiry[k][0]/itemsExpiry[k][1])

#     return itemsExpiry

# print(requests.get(f'hfirebaseurl/expiry.json').text)
# expirys = avg_expiry(json.loads(requests.get(f'hfirebaseurl/expiry.json').text))
# print(expirys)

            
