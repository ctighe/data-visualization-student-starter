# Final Project Exploration 1


### Topic/domain: Cyberattacks and how they have changed with the advent of AI

How have the targeting and frequency of cyberattacks changed since AI became more competent/powerful?
Have the types of cyberattacks changed significantly- are there any attack vectors that are more or less easily executed with AI assistance?

Mostly inspired by the dataset I found for the Week 02 assignment, located at https://espace.library.uq.edu.au/view/UQ:dfe5027. This dataset is limited to the 2004-2019 range, so I would want to find similar-quality datasets from more recent years to compare how their attribute distributions might have changed.

https://www.crowdstrike.com/en-us/cybersecurity-101/cyberattacks/ai-powered-cyberattacks/
https://informationisbeautiful.net/visualizations/worlds-biggest-data-breaches-hacks/
https://cybermap.kaspersky.com/
(Probably can't do anything quite as fancy as the live-updating cybermap, but something similar in terms of attack visualizations)

My hand-drawn art skills are already not very good, so making these rough approximations means most of the content is going to be in the explanations. Also my phone doesn't have a good camera so I tried to explain as much as I could to get around the blurry images.

<img width="2340" height="4160" alt="KIMG0316" src="https://github.com/user-attachments/assets/2f4977a9-c2e8-4e6c-83d1-7372d022f84e" />
Map view- cyberattacks have an origin and target (maybe the origin isn't clear because of a botnet), so a map-based view (either 2D projection or globe like in cybermap) makes sense. Having some kind of additional filters for specific targeted attributes also makes obvious sense.

<img width="2340" height="4160" alt="KIMG0317" src="https://github.com/user-attachments/assets/e1e037ef-0d90-45f4-84e4-26b7ccb148af" />
Globe view- for looking at attacks that exfiltrated records or some measurable amount of data (or for ransomware attacks that were paid off) having a globe with stacked representations of whatever attribute seems interesting. It would require a couple of different filters for which specific numeric attribute the user wants to view, but this takes more direct inspiration from the cybermap viz. Having the numbers physically represented would also help to convey the scale of each attack and how effective/damaging it was- the recent 2.6 billion record leak is an enormous number that they managed to somewhat convey in the second link, but I think that having a 3D comparison would make it more impactful.

<img width="2340" height="4160" alt="KIMG0318" src="https://github.com/user-attachments/assets/d7405e97-1877-4833-880a-acfc92cbe0b4" />
3D grid view- I was imagining a 2D grid with selectable (ordinal) attributes (in this drawing, scale and data sensitivity) that could also give a more physical sense of scale for the data. The viewer would be able to rotate the view and see how various attributes correlated with each other in a more freeform way that doesn't rely on simple bar charts or scatterplots. I was also thinking about having two duplicated versions, maybe one mirrored underneath, with one showing "normal" or pre-AI cyberattacks while the other shows post-AI cyberattacks. The goal would be to have them update in sync as the user rotates or changes axis attributes to directly show how the patterns in cyberattacks changed as AI got more prevalent. It might also be useful to have a slider for when the user wants to make the division between the two graphs, perhaps with a suggested "this is where AI got more capable" range highlighted.
