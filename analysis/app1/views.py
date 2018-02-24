from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse


import pandas as pd
from shapely.geometry import Point, shape
import json


data_path = './input/'

# Create your views here.

def index(request):
	return render(request, 'app1/index.html')
	# return HttpResponse("index")


def data(request):
	df_clean = pd.read_csv('../dataset_csv_SW.csv')
	print df_clean
	df_clean.drop('name', axis=1, inplace=True)	
	# print (df_clean.to_json(orient='records'))
	a = (df_clean.to_json(orient='records'))
	print(a)

	return HttpResponse(a)
	# return df_clean.to_json(orient='records')