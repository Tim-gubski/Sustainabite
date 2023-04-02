import cv2
import requests
import json
import time, datetime
from helper import most_frequent, avg_points
from search import find_barcode
x = requests.get('https://api.upcitemdb.com/prod/trial/lookup?upc=075720481279')
print(x.text)

# expirys = avg_expiry(json.loads(requests.get(f'hfirebaseurl/expiry.json').text))
# print(expirys)

camera_id = 1
delay = 1
window_name = 'OpenCV Barcode'

bd = cv2.barcode.BarcodeDetector()
cap = cv2.VideoCapture(camera_id)

item_lookup = {
    "ENERGY DRINK":"milk",
    "HAVARTI CREAMY CHEESE, HAVARTI CREAMY":"cheese",
    "2% Milk, 1 Gallon":"milk"
}


start = time.time()
codes = []
while True:
    ret, frame = cap.read()
    if ret:
        ret_bc, decoded_info, _, points = bd.detectAndDecode(frame)
        if ret_bc:
            frame = cv2.polylines(frame, points.astype(int), True, (0, 255, 0), 3)
            for s, p in zip(decoded_info, points):
                if s:
                    codes.append({"code":s,"points":p})
                    frame = cv2.putText(frame, s, p[1].astype(int),
                                        cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 2, cv2.LINE_AA)
        cv2.imshow(window_name, frame)

    if cv2.waitKey(delay) & 0xFF == ord('q'):
        break
    
    if time.time() - start > 1:
        start = time.time()
        if len(codes) > 5:
            code = most_frequent([i["code"] for i in codes])
            print(code)
            positions = [avg_points(i["points"]) for i in codes if i["code"] == code]
            dx = sum([positions[i][0] - positions[i+1][0] for i in range(len(positions)-1)])/len(positions)
            # dy = sum([positions[i][1] - positions[i+1][1] for i in range(len(positions)-1)])/len(positions)
            name = find_barcode(code)
            print(name)
            if(name != None):
              if dx < 0:
                  now = datetime.datetime.now()
                  expiry = now + datetime.timedelta(days=7)
                  x = requests.put(f"hfirebaseurl/items/{code}.json",json={"brand":name,"name":item_lookup[name] if name in item_lookup else name,"expiry":expiry.strftime("%m/%d/%Y"),"purchase_date":datetime.datetime.now().strftime("%m/%d/%Y")})
                  print(x.text)
              else:
                  requests.delete(f"hfirebaseurl/items/{code}.json")
            codes = []
            

cv2.destroyWindow(window_name)