import re
import csv

# 29/03/2022 13:47 - +55 21 97165-5563: em vez de vir direto pra eci
pattern = re.compile(r'(\d{2}/\d{2}/\d{4} \d{2}:\d{2}) - ([^:]+): (.+)')

sender_ids = {}
current_id = 1

with open('Historico_wpp.txt', 'r', encoding='utf-8') as f:
    text = f.read()

messages = []
for match in pattern.findall(text):
    timestamp, sender, message = match
    
    if sender not in sender_ids:
        sender_ids[sender] = current_id
        current_id += 1
    
    sender_id = sender_ids[sender]
    messages.append((sender_id, timestamp, message))


filtered_messages = []
for message in messages:
    text:str = message[2]
    if '<Mídia oculta>' in text:
        continue
    if text == '.':
        continue
    if all(char.upper() == 'K' for char in text):
        continue
    if '.vcf (arquivo anexado)' in text:
        continue
    if text == 'Mensagem apagada':
        continue
    filtered_messages.append(message)


with open('historico_conversa_filtered.csv', 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['senderId', 'timestamp', 'message'])
    writer.writerows(filtered_messages)



