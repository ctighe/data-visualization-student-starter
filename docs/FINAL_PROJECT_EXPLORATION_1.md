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

### Task Analysis

I want to analyze how the types and targets of cyberattacks have changed since AI started becoming more powerful by looking at the occurrence rates of various kinds of cyberattacks (phishing, malware, impersonation scams, etc) over time, with markers for releases/improvements of particularly significant AI tools like ChatGPT, Dall-E, and other generative tools. 
I also want to see if AI-assisted scams/cyberattacks are more targeted towards specific sizes of companies or organizations, and whether certain types of cyberattacks became more common with the advent of new AI tools.


### Validation

<b>Domain:</b> 
I think the specific domain I would be targeting is one of two options, or maybe both. One group is AI researchers who want to know what kinds of cyber-threats AI (or AI-enabled humans) cause, what types of attacks are more common in an AI-empowered world, and what types of targets are being hit. The goal would be to use this understanding to develop stronger safeguards to keep AI safer and reduce the dangerous potential of misuse for those specific types of scenarios.  The other group I'm thinking of would be industry cybersecurity specialists, especially those who are trying to convince their higher-ups to invest in better security training for employees. Having a way to clearly display how the threats are changing over time as AI gets more powerful and understand what the most common attack types are to recommend specific training or system changes seems like it would be very useful.

<b>Task/Data:</b> 
The specific tasks that I'm looking to enable or support would be trend detection/recognition and communicating priorities. I would also probably do a little bit of transformation in the form of aggregation and/or summarizing to help make the visualizations cleaner.
The data blocks I'd be working with are probably mostly categorical-based data, with some ordinal data as well. Since the "ideal user" is looking for either larger-scale trends or are more narrowly-scoped filterable subset of the data, preserving the category structure and focusing on summaries of those layers and comparing those summaries between the two time periods would be the main goal.

<b>Idiom:</b> 
The visual encoding idiom/design that I would focus on is heavily comparison-based. The entire goal of the visualizations would be to do a large-scale comparison between pre-AI and post-AI cyberattacks, so the design should reflect that. I think having a linked dual view of the data, where one side contains one time window and the other side contains the remaining time window, would be the most immediate approach. The scaling between the two views might be a little off though, so I could also see having a kind of overlay of the two time windows in the same view (and thus the same scale) could help with keeping consistent comparisons in the visualizations. My concern with overlays would be visual clarity and noise, so there would have to be more focus on keeping the viz clean and simple to allow for the overlay to still be useful.

<b>Algorithm:</b>
The main algorithm work that would go into this kind of viz would be ensuring that the data can be cleanly filtered/operated on in both views/time windows at the same time. Considering that there isn't a clean pre-AI and post-AI boundary, having some sort of user-defined threshold or boundary window would make the most sense, and that would cause some extra issues for computing all the aggregate/summary statistics every time the user tweaks the date threshold. One possible way of handling this would be to pre-compute the appropriate statistics for each large date range (say, for each year) and then only compute the final summary statistics for the viz from those chunked mini-summaries. This would likely result in significant improvements in responsiveness.

### Updated Alterations

Because of the specific focus I decided on in the task analysis step, I realized that having a geographic/map-based visualization is probably not a good fit. The type of comparison I want to support with the visualizations isn't especially tied to geographic locations, so it's a less important idiom to focus on. 

<img width="4160" height="2340" alt="image" src="https://github.com/user-attachments/assets/c489da9b-efb0-48bb-8313-286e91b33ceb" />
This is an approximation of my "north star" goal for the final project. Ideally I'd like to create a dual-view comparison viz dashboard with a high degree of user customization. I want the user to be able to compare parts of a dataset in multiple possible views, while being able to define how they want to split the data between the views. I also had an interesting idea of letting the user build their own derived attribute to visualize. The thought was that by giving the user the ability to select and define how they want to aggregate and display the data, it would encourage more play-like exploration of the dataset and potentially lead to more interesting discoveries of patterns or trends in the data.
